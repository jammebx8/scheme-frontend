"use client";

import { useState } from "react";
import { documents as docsApi } from "@/lib/api";
import toast from "react-hot-toast";
import { Shield, ExternalLink, CheckCircle2 } from "lucide-react";

interface Props {
  onSkip: () => void;
  onConnected: () => void;
}

export default function DigiLockerConnect({ onSkip, onConnected }: Props) {
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);

  const handleConnect = async () => {
    setLoading(true);
    try {
      const { auth_url } = await docsApi.getDigiLockerAuthUrl();
      // Open in a popup
      const popup = window.open(auth_url, "DigiLocker", "width=600,height=700");

      // Listen for callback message from popup
      const listener = (event: MessageEvent) => {
        if (event.data?.type === "digilocker_connected") {
          window.removeEventListener("message", listener);
          popup?.close();
          setConnected(true);
          toast.success("DigiLocker connected! Documents imported.");
          onConnected();
        }
      };
      window.addEventListener("message", listener);

      // Fallback: poll for popup close
      const pollTimer = setInterval(() => {
        if (popup?.closed) {
          clearInterval(pollTimer);
          window.removeEventListener("message", listener);
          setLoading(false);
        }
      }, 1000);
    } catch {
      toast.error("Could not get DigiLocker auth URL");
      setLoading(false);
    }
  };

  if (connected) {
    return (
      <div className="text-center py-8">
        <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">DigiLocker Connected!</h3>
        <p className="text-gray-500 text-sm">Your documents have been imported securely.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <Shield size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">DigiLocker</h3>
            <p className="text-xs text-gray-500">Government of India Digital Document Wallet</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Connect your DigiLocker account to automatically import your Aadhaar, PAN, and other
          government documents. This is the most secure and fastest way to get started.
        </p>
        <div className="space-y-2 text-sm text-gray-600">
          {[
            "✅ Verified documents directly from government",
            "✅ No manual uploads needed",
            "✅ Faster application processing",
            "✅ 100% secure — we never store passwords",
          ].map((item) => (
            <div key={item}>{item}</div>
          ))}
        </div>
      </div>

      <button
        onClick={handleConnect}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition"
      >
        {loading ? (
          <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5" />
        ) : (
          <>
            <ExternalLink size={18} />
            Connect with DigiLocker
          </>
        )}
      </button>

      <button
        onClick={onSkip}
        className="w-full text-sm text-gray-500 hover:text-gray-700 py-2 transition"
      >
        Skip — I'll upload documents manually
      </button>
    </div>
  );
}
