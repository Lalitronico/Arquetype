"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Plus, GripVertical, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ImageConfig {
  imageUrl?: string;
  imageUrls?: string[];
  imageLabels?: string[];
  imagePrompt?: string;
  imageScaleMin?: number;
  imageScaleMax?: number;
  imageScaleLabels?: { low: string; high: string };
}

interface ImageQuestionConfigProps {
  questionType: "image_rating" | "image_choice" | "image_comparison";
  value: ImageConfig;
  onChange: (config: ImageConfig) => void;
}

const DEFAULT_SCALE_LABELS = {
  5: { low: "Very Poor", high: "Excellent" },
  7: { low: "Strongly Dislike", high: "Strongly Like" },
  10: { low: "Not at all", high: "Extremely" },
};

export function ImageQuestionConfig({ questionType, value, onChange }: ImageQuestionConfigProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (
    e: React.ChangeEvent<HTMLInputElement>,
    targetIndex?: number
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    setIsUploading(true);
    if (targetIndex !== undefined) {
      setUploadingIndex(targetIndex);
    }

    try {
      const file = files[0];

      // Client-side validation
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size exceeds 5MB limit");
      }

      const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        throw new Error("Invalid file type. Allowed: JPEG, PNG, GIF, WebP");
      }

      // Upload file
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      // Update config based on question type
      if (questionType === "image_rating" || questionType === "image_choice") {
        onChange({ ...value, imageUrl: data.url });
      } else if (questionType === "image_comparison") {
        const newUrls = [...(value.imageUrls || [])];
        const newLabels = [...(value.imageLabels || [])];

        if (targetIndex !== undefined) {
          newUrls[targetIndex] = data.url;
        } else {
          newUrls.push(data.url);
          newLabels.push(`Image ${newUrls.length}`);
        }

        onChange({ ...value, imageUrls: newUrls, imageLabels: newLabels });
      }
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadingIndex(null);
      // Reset input
      if (e.target) {
        e.target.value = "";
      }
    }
  }, [questionType, value, onChange]);

  const handleRemoveImage = useCallback(async (indexOrSingle: number | "single") => {
    try {
      const pathToDelete = indexOrSingle === "single"
        ? value.imageUrl
        : value.imageUrls?.[indexOrSingle];

      if (pathToDelete) {
        // Extract just the filename from the URL
        const fileName = pathToDelete.split("/").pop();
        if (fileName) {
          await fetch(`/api/upload?path=${encodeURIComponent(fileName)}`, {
            method: "DELETE",
          });
        }
      }

      if (indexOrSingle === "single") {
        onChange({ ...value, imageUrl: undefined });
      } else {
        const newUrls = [...(value.imageUrls || [])];
        const newLabels = [...(value.imageLabels || [])];
        newUrls.splice(indexOrSingle, 1);
        newLabels.splice(indexOrSingle, 1);
        onChange({ ...value, imageUrls: newUrls, imageLabels: newLabels });
      }
    } catch (error) {
      console.error("Failed to delete image:", error);
    }
  }, [value, onChange]);

  const handleLabelChange = useCallback((index: number, label: string) => {
    const newLabels = [...(value.imageLabels || [])];
    newLabels[index] = label;
    onChange({ ...value, imageLabels: newLabels });
  }, [value, onChange]);

  const handleScaleChange = useCallback((scaleMax: number) => {
    const defaults = DEFAULT_SCALE_LABELS[scaleMax as keyof typeof DEFAULT_SCALE_LABELS] || { low: "Low", high: "High" };
    onChange({
      ...value,
      imageScaleMax: scaleMax,
      imageScaleLabels: defaults,
    });
  }, [value, onChange]);

  // Render single image uploader (for image_rating and image_choice)
  const renderSingleImageUploader = () => (
    <div className="space-y-3">
      <Label>Image</Label>
      {value.imageUrl ? (
        <div className="relative inline-block">
          <img
            src={value.imageUrl}
            alt="Uploaded"
            className="max-w-xs max-h-48 rounded-lg border object-cover"
          />
          <button
            type="button"
            onClick={() => handleRemoveImage("single")}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isUploading
              ? "border-[#A78BFA] bg-[#F3F0FF]"
              : "border-gray-300 hover:border-[#A78BFA] hover:bg-[#F3F0FF]/50"
          }`}
          onClick={() => !isUploading && fileInputRef.current?.click()}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 text-[#7C3AED] animate-spin" />
              <span className="text-sm text-[#7C3AED]">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-gray-400" />
              <span className="text-sm text-gray-600">Click to upload image</span>
              <span className="text-xs text-gray-400">JPEG, PNG, GIF, WebP up to 5MB</span>
            </div>
          )}
        </div>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={(e) => handleFileSelect(e)}
        className="hidden"
      />
    </div>
  );

  // Render multiple image uploader (for image_comparison)
  const renderMultipleImageUploader = () => (
    <div className="space-y-3">
      <Label>Images to Compare (2-4 images)</Label>
      <div className="grid gap-4 sm:grid-cols-2">
        {(value.imageUrls || []).map((url, index) => (
          <div key={index} className="relative border rounded-lg p-3 bg-gray-50">
            <div className="flex items-start gap-3">
              <div className="flex items-center text-gray-400">
                <GripVertical className="h-5 w-5" />
              </div>
              <div className="flex-1 space-y-2">
                <div className="relative inline-block">
                  <img
                    src={url}
                    alt={`Image ${index + 1}`}
                    className="max-w-full max-h-32 rounded border object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(index)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <Input
                  placeholder={`Label for Image ${index + 1}`}
                  value={value.imageLabels?.[index] || ""}
                  onChange={(e) => handleLabelChange(index, e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Add image button */}
        {(value.imageUrls?.length || 0) < 4 && (
          <div
            className={`border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
              isUploading && uploadingIndex === null
                ? "border-[#A78BFA] bg-[#F3F0FF]"
                : "border-gray-300 hover:border-[#A78BFA] hover:bg-[#F3F0FF]/50"
            }`}
            onClick={() => !isUploading && multiFileInputRef.current?.click()}
          >
            {isUploading && uploadingIndex === null ? (
              <>
                <Loader2 className="h-6 w-6 text-[#7C3AED] animate-spin" />
                <span className="text-sm text-[#7C3AED]">Uploading...</span>
              </>
            ) : (
              <>
                <Plus className="h-6 w-6 text-gray-400" />
                <span className="text-sm text-gray-600">Add Image</span>
              </>
            )}
          </div>
        )}
      </div>
      <input
        ref={multiFileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={(e) => handleFileSelect(e)}
        className="hidden"
      />
      {(value.imageUrls?.length || 0) < 2 && (
        <p className="text-xs text-amber-600">
          Add at least 2 images for comparison
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-purple-50/30">
      <div className="text-sm font-medium text-purple-700 flex items-center gap-2">
        <ImageIcon className="h-4 w-4" />
        {questionType === "image_rating" && "Image Rating Configuration"}
        {questionType === "image_choice" && "Image + Options Configuration"}
        {questionType === "image_comparison" && "Image Comparison Configuration"}
      </div>

      {/* Upload Error Display */}
      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {uploadError}
        </div>
      )}

      {/* Image Uploader */}
      {(questionType === "image_rating" || questionType === "image_choice") && renderSingleImageUploader()}
      {questionType === "image_comparison" && renderMultipleImageUploader()}

      {/* Scale Configuration (for image_rating) */}
      {questionType === "image_rating" && (
        <div className="space-y-4 pt-4 border-t">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Rating Scale</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={value.imageScaleMin || 1}
                  onChange={(e) => onChange({ ...value, imageScaleMin: parseInt(e.target.value) || 1 })}
                  className="w-16"
                  min={0}
                  max={(value.imageScaleMax || 5) - 1}
                />
                <span className="text-gray-500">to</span>
                <select
                  value={value.imageScaleMax || 5}
                  onChange={(e) => handleScaleChange(parseInt(e.target.value))}
                  className="h-10 rounded-md border border-gray-200 px-3"
                >
                  <option value={5}>5</option>
                  <option value={7}>7</option>
                  <option value={10}>10</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Low Rating Label</Label>
              <Input
                placeholder="e.g., Very Poor"
                value={value.imageScaleLabels?.low || ""}
                onChange={(e) =>
                  onChange({
                    ...value,
                    imageScaleLabels: {
                      ...value.imageScaleLabels,
                      low: e.target.value,
                      high: value.imageScaleLabels?.high || "Excellent",
                    },
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>High Rating Label</Label>
              <Input
                placeholder="e.g., Excellent"
                value={value.imageScaleLabels?.high || ""}
                onChange={(e) =>
                  onChange({
                    ...value,
                    imageScaleLabels: {
                      ...value.imageScaleLabels,
                      low: value.imageScaleLabels?.low || "Very Poor",
                      high: e.target.value,
                    },
                  })
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Custom Evaluation Prompt */}
      <div className="space-y-2 pt-4 border-t">
        <Label>Custom Evaluation Prompt (optional)</Label>
        <Textarea
          placeholder={
            questionType === "image_rating"
              ? "e.g., Evaluate this logo design considering visual appeal, memorability, and professionalism."
              : questionType === "image_choice"
              ? "e.g., Look at this product image and answer the following question about your impression."
              : "e.g., Compare these design options and explain which one you prefer and why."
          }
          value={value.imagePrompt || ""}
          onChange={(e) => onChange({ ...value, imagePrompt: e.target.value })}
          rows={3}
        />
        <p className="text-xs text-gray-500">
          Guide how personas should evaluate the image(s). Leave blank to use default prompts.
        </p>
      </div>

      {/* Preview */}
      {(value.imageUrl || (value.imageUrls?.length || 0) > 0) && (
        <div className="space-y-2 pt-4 border-t">
          <Label>Preview</Label>
          <div className="border rounded-lg p-4 bg-white">
            {questionType === "image_rating" && value.imageUrl && (
              <div className="space-y-4">
                <img
                  src={value.imageUrl}
                  alt="Preview"
                  className="max-w-sm max-h-48 mx-auto rounded-lg border object-cover"
                />
                <div className="flex justify-center gap-2">
                  {Array.from(
                    { length: (value.imageScaleMax || 5) - (value.imageScaleMin || 1) + 1 },
                    (_, i) => i + (value.imageScaleMin || 1)
                  ).map((rating) => (
                    <div
                      key={rating}
                      className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center text-sm font-medium text-gray-600"
                    >
                      {rating}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 px-4">
                  <span>{value.imageScaleLabels?.low || "Low"}</span>
                  <span>{value.imageScaleLabels?.high || "High"}</span>
                </div>
              </div>
            )}

            {questionType === "image_comparison" && (value.imageUrls?.length || 0) > 0 && (
              <div className="space-y-4">
                <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(value.imageUrls?.length || 2, 4)}, 1fr)` }}>
                  {value.imageUrls?.map((url, index) => (
                    <div key={index} className="text-center">
                      <img
                        src={url}
                        alt={value.imageLabels?.[index] || `Image ${index + 1}`}
                        className="w-full max-h-32 rounded-lg border object-cover mx-auto"
                      />
                      <div className="mt-2 text-sm font-medium text-gray-700">
                        {value.imageLabels?.[index] || `Image ${index + 1}`}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center text-sm text-gray-500">
                  Respondents will choose or rank these images
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageQuestionConfig;
