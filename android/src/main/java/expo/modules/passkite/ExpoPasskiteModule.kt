package expo.modules.passkite

import android.app.Activity
import android.content.Intent
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.Promise
import com.google.android.gms.pay.Pay
import com.google.android.gms.pay.PayClient
import com.google.android.gms.pay.PayApiAvailabilityStatus

class ExpoPasskiteModule : Module() {
    private var payClient: PayClient? = null
    private var pendingPromise: Promise? = null

    companion object {
        private const val ADD_TO_WALLET_REQUEST_CODE = 1001
    }

    override fun definition() = ModuleDefinition {
        Name("ExpoPasskite")

        Events("onPassAdded", "onPassRemoved")

        OnCreate {
            val activity = appContext.currentActivity
            if (activity != null) {
                payClient = Pay.getClient(activity)
            }
        }

        // Check if passes can be added (Google Wallet available)
        AsyncFunction("canAddPasses") { promise: Promise ->
            val client = payClient
            if (client == null) {
                promise.resolve(false)
                return@AsyncFunction
            }

            client.getPayApiAvailabilityStatus(PayClient.RequestType.SAVE_PASSES)
                .addOnSuccessListener { status ->
                    promise.resolve(status == PayApiAvailabilityStatus.AVAILABLE)
                }
                .addOnFailureListener {
                    promise.resolve(false)
                }
        }

        // Check if pass library is available (Google Wallet installed)
        AsyncFunction("isPassLibraryAvailable") { promise: Promise ->
            val client = payClient
            if (client == null) {
                promise.resolve(false)
                return@AsyncFunction
            }

            client.getPayApiAvailabilityStatus(PayClient.RequestType.SAVE_PASSES)
                .addOnSuccessListener { status ->
                    promise.resolve(status == PayApiAvailabilityStatus.AVAILABLE)
                }
                .addOnFailureListener {
                    promise.resolve(false)
                }
        }

        // Check if a specific pass exists (not directly supported on Android)
        AsyncFunction("containsPass") { _: String, _: String ->
            // Google Wallet doesn't provide an API to check if a specific pass exists
            // Return false as we cannot determine this
            false
        }

        // Add a pass to Google Wallet
        // Note: For Google Wallet, we need a JWT token from Google Pay API, not a .pkpass file
        // This implementation shows a placeholder - in practice, you'd need to implement
        // Google Wallet pass creation server-side and pass a JWT here
        AsyncFunction("addPassToWallet") { passData: String, promise: Promise ->
            val client = payClient
            val activity = appContext.currentActivity

            if (client == null || activity == null) {
                promise.resolve(mapOf(
                    "success" to false,
                    "error" to "Google Wallet client not available"
                ))
                return@AsyncFunction
            }

            // Store promise for result handling
            pendingPromise = promise

            // The passData for Android should be a Google Wallet JWT token
            // For Apple .pkpass files, we cannot directly add them to Google Wallet
            // You would need to convert the pass data to Google Wallet format server-side

            try {
                // If passData is a Google Wallet JWT, use savePasses
                client.savePasses(passData, activity, ADD_TO_WALLET_REQUEST_CODE)
            } catch (e: Exception) {
                pendingPromise = null
                promise.resolve(mapOf(
                    "success" to false,
                    "error" to "Failed to add pass: ${e.message}"
                ))
            }
        }

        // Handle activity result
        OnActivityResult { _, payload ->
            if (payload.requestCode == ADD_TO_WALLET_REQUEST_CODE) {
                val promise = pendingPromise
                pendingPromise = null

                when (payload.resultCode) {
                    Activity.RESULT_OK -> {
                        promise?.resolve(mapOf(
                            "success" to true,
                            "error" to null
                        ))
                        sendEvent("onPassAdded", mapOf(
                            "passTypeIdentifier" to "",
                            "serialNumber" to ""
                        ))
                    }
                    Activity.RESULT_CANCELED -> {
                        promise?.resolve(mapOf(
                            "success" to false,
                            "error" to "User cancelled"
                        ))
                    }
                    else -> {
                        promise?.resolve(mapOf(
                            "success" to false,
                            "error" to "Unknown error occurred"
                        ))
                    }
                }
            }
        }
    }
}
