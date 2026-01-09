import ExpoModulesCore
import PassKit

public class ExpoPasskiteModule: Module {
    private var passLibrary: PKPassLibrary?
    private var currentAddPassController: PKAddPassesViewController?

    public func definition() -> ModuleDefinition {
        Name("ExpoPasskite")

        Events("onPassAdded", "onPassRemoved")

        OnCreate {
            if PKPassLibrary.isPassLibraryAvailable() {
                self.passLibrary = PKPassLibrary()
                self.startObservingPassLibrary()
            }
        }

        OnDestroy {
            self.stopObservingPassLibrary()
        }

        // Check if passes can be added
        AsyncFunction("canAddPasses") { () -> Bool in
            return PKAddPassesViewController.canAddPasses()
        }

        // Check if pass library is available
        AsyncFunction("isPassLibraryAvailable") { () -> Bool in
            return PKPassLibrary.isPassLibraryAvailable()
        }

        // Check if a specific pass exists in the wallet
        AsyncFunction("containsPass") { (passTypeIdentifier: String, serialNumber: String) -> Bool in
            guard let library = self.passLibrary else {
                return false
            }

            if let pass = library.pass(withPassTypeIdentifier: passTypeIdentifier, serialNumber: serialNumber) {
                return library.containsPass(pass)
            }
            return false
        }

        // Add a pass to the wallet
        AsyncFunction("addPassToWallet") { (passBase64: String, promise: Promise) in
            guard let passData = Data(base64Encoded: passBase64) else {
                promise.resolve([
                    "success": false,
                    "error": "Invalid base64 data"
                ])
                return
            }

            guard PKAddPassesViewController.canAddPasses() else {
                promise.resolve([
                    "success": false,
                    "error": "Cannot add passes on this device"
                ])
                return
            }

            do {
                let pass = try PKPass(data: passData)

                // Check if pass already exists
                if let library = self.passLibrary, library.containsPass(pass) {
                    promise.resolve([
                        "success": false,
                        "error": "Pass already exists in wallet"
                    ])
                    return
                }

                // Present the add pass view controller
                DispatchQueue.main.async {
                    guard let viewController = self.appContext?.utilities?.currentViewController() else {
                        promise.resolve([
                            "success": false,
                            "error": "Could not find view controller to present from"
                        ])
                        return
                    }

                    guard let addPassController = PKAddPassesViewController(pass: pass) else {
                        promise.resolve([
                            "success": false,
                            "error": "Could not create add pass controller"
                        ])
                        return
                    }

                    self.currentAddPassController = addPassController

                    // Create a completion handler
                    let completion = PassAdditionCompletion(pass: pass, library: self.passLibrary, promise: promise)
                    addPassController.delegate = completion

                    // Store completion to prevent deallocation
                    objc_setAssociatedObject(
                        addPassController,
                        "completion",
                        completion,
                        .OBJC_ASSOCIATION_RETAIN_NONATOMIC
                    )

                    viewController.present(addPassController, animated: true)
                }
            } catch {
                promise.resolve([
                    "success": false,
                    "error": "Failed to parse pass data: \(error.localizedDescription)"
                ])
            }
        }.runOnQueue(.main)
    }

    private let passLibraryDidChangeNotification = NSNotification.Name("PKPassLibraryDidChangeNotification")

    private func startObservingPassLibrary() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(passLibraryDidChange),
            name: passLibraryDidChangeNotification,
            object: passLibrary
        )
    }

    private func stopObservingPassLibrary() {
        NotificationCenter.default.removeObserver(
            self,
            name: passLibraryDidChangeNotification,
            object: passLibrary
        )
    }

    @objc private func passLibraryDidChange(_ notification: Notification) {
        guard let userInfo = notification.userInfo else { return }

        // Check for added passes - use string key for compatibility
        if let addedPasses = userInfo["PKPassLibraryAddedPassesUserInfoKey"] as? [PKPass] {
            for pass in addedPasses {
                sendEvent("onPassAdded", [
                    "passTypeIdentifier": pass.passTypeIdentifier,
                    "serialNumber": pass.serialNumber
                ])
            }
        }

        // Check for removed passes - use string key for compatibility
        if let removedPasses = userInfo["PKPassLibraryRemovedPassInfosUserInfoKey"] as? [[String: Any]] {
            for passInfo in removedPasses {
                if let passTypeIdentifier = passInfo["PKPassLibraryPassTypeIdentifierUserInfoKey"] as? String,
                   let serialNumber = passInfo["PKPassLibrarySerialNumberUserInfoKey"] as? String {
                    sendEvent("onPassRemoved", [
                        "passTypeIdentifier": passTypeIdentifier,
                        "serialNumber": serialNumber
                    ])
                }
            }
        }
    }
}

// Helper class to handle add pass completion
private class PassAdditionCompletion: NSObject, PKAddPassesViewControllerDelegate {
    private let pass: PKPass
    private let library: PKPassLibrary?
    private let promise: Promise

    init(pass: PKPass, library: PKPassLibrary?, promise: Promise) {
        self.pass = pass
        self.library = library
        self.promise = promise
        super.init()
    }

    func addPassesViewControllerDidFinish(_ controller: PKAddPassesViewController) {
        controller.dismiss(animated: true) { [weak self] in
            guard let self = self else { return }

            // Check if pass was actually added
            let wasAdded = self.library?.containsPass(self.pass) ?? false

            self.promise.resolve([
                "success": wasAdded,
                "error": wasAdded ? nil : "User cancelled or pass was not added"
            ])
        }
    }
}
