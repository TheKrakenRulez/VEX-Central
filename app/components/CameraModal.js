"use client";

import { useState, useRef, useEffect } from "react";

const isMobileDevice = () =>
  /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export default function CameraModal({ isOpen, onClose, onCapture }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [facingMode, setFacingMode] = useState("environment");
  const [capturedImage, setCapturedImage] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      return;
    }

    let active = true;
    const initCam = async () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("Camera access is not supported by this browser.");
        }
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        const video = videoRef.current;
        if (!video) {
          stream.getTracks().forEach((track) => track.stop());
          throw new Error("Camera preview is unavailable.");
        }
        streamRef.current = stream;
        video.srcObject = stream;
        await video.play();
      } catch (err) {
        if (active) {
          console.error("Camera access error:", err);
          streamRef.current?.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
          setCameraError("Unable to access camera directly. You can select an image file or take a photo via your browser.");
          setLoading(false);
        }
      }
    };

    initCam();

    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen, facingMode]);

  const takeSnap = () => {
    if (!videoRef.current) {
      setCameraError("Camera preview is unavailable. You can select an image file instead.");
      return;
    }
    const video = videoRef.current;
    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth || !video.videoHeight) {
      setCameraError("The camera frame is not ready yet. Please wait a moment or select an image file.");
      return;
    }
    const canvas = document.createElement("canvas");
    const MAX_WIDTH = 800;
    const scale = Math.min(1, MAX_WIDTH / video.videoWidth);
    canvas.width = video.videoWidth * scale;
    canvas.height = video.videoHeight * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setCameraError("Unable to capture an image from this camera. You can select an image file instead.");
      return;
    }
    try {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
      setCapturedImage(dataUrl);
    } catch (err) {
      console.error("Camera capture error:", err);
      setCameraError("Unable to capture an image from this camera. You can select an image file instead.");
    }
  };

  const handleClose = () => {
    setCapturedImage(null);
    setCameraError(null);
    onClose();
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      handleClose();
    }
  };

  const toggleCamera = () => {
    if (!isMobileDevice()) {
      window.alert("Flipping the camera is only available on mobile devices.");
      return;
    }
    setLoading(true);
    setCameraError(null);
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <h3 className="text-white font-mono font-bold text-sm flex items-center gap-2">
            <span>📸</span> Take Photo
          </h3>
          <button onClick={handleClose} className="text-slate-400 hover:text-white font-mono text-sm px-2 py-1 rounded">
            ✕
          </button>
        </div>

        {/* Viewfinder / Preview */}
        <div className="relative bg-black aspect-video flex items-center justify-center overflow-hidden">
          {capturedImage ? (
            <img src={capturedImage} alt="Captured snap" className="w-full h-full object-contain" />
          ) : cameraError ? (
            <div className="p-6 text-center space-y-3">
              <p className="text-slate-400 font-mono text-xs">{cameraError}</p>
              <label className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors">
                <span>📷</span> Take Photo / Select File
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        onCapture(evt.target.result);
                        handleClose();
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
          ) : (
            <>
              {loading && <div className="text-slate-400 font-mono text-xs">Starting Camera...</div>}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                onLoadedData={() => setLoading(false)}
                className={`w-full h-full object-contain ${loading ? "hidden" : "block"}`}
              />
            </>
          )}

          {!capturedImage && !cameraError && !loading && (
            <button
              onClick={toggleCamera}
              className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white font-mono text-xs px-2.5 py-1.5 rounded-lg border border-white/20 backdrop-blur transition-all flex items-center gap-1.5"
              title="Flip Camera"
            >
              🔄 <span className="hidden sm:inline">Flip</span>
            </button>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
          {capturedImage ? (
            <>
              <button
                onClick={() => setCapturedImage(null)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs py-2.5 rounded-xl font-bold transition-colors"
              >
                🔄 Retake
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs py-2.5 rounded-xl font-bold shadow-lg transition-colors flex items-center justify-center gap-2"
              >
                <span>✓</span> Use Photo
              </button>
            </>
          ) : !cameraError ? (
            <>
              <button
                onClick={handleClose}
                className="px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs py-2.5 rounded-xl font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={takeSnap}
                disabled={loading}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs py-2.5 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                <span>📸</span> Snap Photo
              </button>
            </>
          ) : (
            <button
              onClick={handleClose}
              className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs py-2.5 rounded-xl font-bold transition-colors"
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
