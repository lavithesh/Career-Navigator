import React, { useState } from "react";
import { toast } from "react-hot-toast";

const ProfileForm: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!selectedFile) {
        toast.error("Please select a file to upload");
        return;
      }

      // Create FormData
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Upload file first
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file");
      }

      const uploadData = await uploadResponse.json();
      console.log("Upload response:", uploadData); // Debug log

      // Now update profile with the file URL
      const updateResponse = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profilePicture: uploadData.url, // Use the URL from upload response
        }),
      });

      if (!updateResponse.ok) {
        throw new Error("Failed to update profile");
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile");
    }
  };

  return (
    <div>
      {/* Render your form here */}
    </div>
  );
};

export default ProfileForm;
