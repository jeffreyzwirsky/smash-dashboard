import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { boxesAPI } from '../../services/api';
import { Upload, X, CheckCircle } from 'lucide-react';

interface PhotoUploadProps {
  boxId: number;
  currentPhotos: { [key: string]: string | undefined };
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({ boxId, currentPhotos }) => {
  const [uploading, setUploading] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: ({ photoField, file }: { photoField: string; file: File }) =>
      boxesAPI.uploadPhoto(boxId, photoField, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['box', boxId] });
      setUploading(null);
    },
  });

  const handleFileSelect = async (photoField: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploading(photoField);
    uploadMutation.mutate({ photoField, file });
  };

  const photoSlots = ['photo1', 'photo2', 'photo3', 'photo4', 'photo5', 'photo6', 'photo7', 'photo8'];

  return (
    <div className="card">
      <h2 className="text-xl font-semibold mb-4">Box Photos (8 max)</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {photoSlots.map((slot) => (
          <div key={slot} className="relative">
            <label className="block text-sm font-medium mb-1 capitalize">
              {slot.replace('photo', 'Photo ')}
            </label>
            <div className="relative aspect-square border-2 border-dashed border-gray-300 rounded-lg overflow-hidden hover:border-primary-500 transition-colors">
              {currentPhotos[slot] ? (
                <>
                  <img
                    src={currentPhotos[slot]}
                    alt={`Box ${slot}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                    <CheckCircle size={16} />
                  </div>
                </>
              ) : uploading === slot ? (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50">
                  <Upload size={24} className="text-gray-400 mb-2" />
                  <span className="text-xs text-gray-500">Click to upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(slot, e)}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-500 mt-4">
        Supported formats: JPG, PNG, WebP. Max size: 10MB per photo.
      </p>
    </div>
  );
};