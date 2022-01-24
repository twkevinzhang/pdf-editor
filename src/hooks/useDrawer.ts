import { useReducer, useCallback, useState, useEffect } from 'react';
import {
  getAllImages,
  removeAllImageFiles,
  saveImageFile,
} from '../utils/StorageService';
import { fileToImage } from './useUploader';

export const useDrawer = () => {
  const [allCandidates, setAllCandidates] = useState<Attachment[]>([]);
  const [flag, setFlag] = useState(false);

  useEffect(() => {
    async function func() {
      const images = await getAllImages();
      setAllCandidates(images);
    }
    func().then();
  }, [flag]);

  const refresh = () => setFlag(!flag);

  return {
    allCandidates: allCandidates,
    refresh,
    removeAllImages: async () => {
      await removeAllImageFiles();
      refresh();
    },
  };
};
