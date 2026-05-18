import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import UserAvatar from "./UserAvatar";

const MAX_SIZE = 2 * 1024 * 1024; // 2 MB
const ALLOWED  = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const ProfilePictureUpload = () => {
  const { user, updateProfilePicture } = useAuth();
  const fileRef = useRef(null);

  const [preview,   setPreview]   = useState(null);
  const [selected,  setSelected]  = useState(null);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState("");
  const [uploading, setUploading] = useState(false);

  const reset = () => {
    setPreview(null);
    setSelected(null);
    setError("");
    setSuccess("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError("");
    setSuccess("");

    if (!ALLOWED.includes(file.type)) {
      setError("Only JPG, PNG, and WebP images are allowed.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("File is too large. Maximum size is 2 MB.");
      return;
    }

    setSelected(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selected) return;
    setUploading(true);
    setError("");
    setSuccess("");

    const result = await updateProfilePicture(selected);

    setUploading(false);
    if (result.success) {
      setSuccess("Profile picture updated successfully.");
      setSelected(null);
      if (fileRef.current) fileRef.current.value = "";
      // Keep preview as the new image (it'll sync via user state anyway)
    } else {
      setError(result.message || "Upload failed. Please try again.");
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
      <h3 className="text-white font-semibold text-lg mb-5">Profile Picture</h3>

      {/* Current / preview image */}
      <div className="flex items-center gap-5 mb-5">
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="w-20 h-20 rounded-full object-cover ring-2 ring-blue-500"
          />
        ) : (
          <UserAvatar user={user} size="xl" />
        )}

        <div>
          <p className="text-slate-300 font-medium">{user?.name}</p>
          <p className="text-slate-500 text-sm">{user?.email}</p>
          {preview && (
            <p className="text-blue-400 text-xs mt-1">Preview — click Upload to save</p>
          )}
        </div>
      </div>

      {/* Error / success */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
          {success}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Action buttons */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm
            font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Choose Photo
        </button>

        {selected && (
          <>
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm
                font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload"
              )}
            </button>

            <button
              type="button"
              onClick={reset}
              disabled={uploading}
              className="px-4 py-2 text-slate-400 hover:text-slate-200 text-sm font-medium
                transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </>
        )}
      </div>

      <p className="text-slate-500 text-xs mt-3">
        JPG, PNG, or WebP · Max 2 MB
      </p>
    </div>
  );
};

export default ProfilePictureUpload;
