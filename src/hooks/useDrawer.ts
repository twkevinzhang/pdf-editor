import { useReducer, useCallback, useState, useEffect } from 'react';
import {
  getAllImageFiles,
  removeAllImageFiles,
  saveImageFile,
} from '../utils/StorageService';
import { fileToImage } from './useUploader';

export const useDrawer = () => {
  const [allCandidates, setAllCandidates] = useState<Attachment[]>([]);
  const [flag, setFlag] = useState(false);

  useEffect(() => {
    async function func() {
      const files = await getAllImageFiles();
      const images = await Promise.all(
        files.map(async (file) => await fileToImage(file))
      );
      setAllCandidates(images);
    }
    func().then();
  }, [flag]);

  const refresh = () => setFlag(!flag);

  return {
    allCandidates: allCandidates,
    saveImage: async (newAttachment: ImageAttachment) => {
      await saveImageFile(newAttachment.file, newAttachment.id);
      refresh();
    },
    removeAllImages: async () => {
      await removeAllImageFiles();
      refresh();
    },
  };
};
