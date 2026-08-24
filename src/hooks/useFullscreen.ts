import { useState, useEffect, useCallback, RefObject } from 'react';

export function useFullscreen(targetRef?: RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentFs = Boolean(
        document.fullscreenElement ||
          (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement ||
          (document as unknown as { mozFullScreenElement?: Element }).mozFullScreenElement ||
          (document as unknown as { msFullscreenElement?: Element }).msFullscreenElement
      );
      setIsFullscreen(isCurrentFs);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const enterFullscreen = useCallback(async () => {
    const elem = targetRef?.current || document.documentElement;
    try {
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as unknown as { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen) {
        await (elem as unknown as { webkitRequestFullscreen: () => Promise<void> }).webkitRequestFullscreen();
      } else if ((elem as unknown as { mozRequestFullScreen?: () => Promise<void> }).mozRequestFullScreen) {
        await (elem as unknown as { mozRequestFullScreen: () => Promise<void> }).mozRequestFullScreen();
      } else if ((elem as unknown as { msRequestFullscreen?: () => Promise<void> }).msRequestFullscreen) {
        await (elem as unknown as { msRequestFullscreen: () => Promise<void> }).msRequestFullscreen();
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  }, [targetRef]);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as unknown as { webkitExitFullscreen?: () => Promise<void> }).webkitExitFullscreen) {
        await (document as unknown as { webkitExitFullscreen: () => Promise<void> }).webkitExitFullscreen();
      } else if ((document as unknown as { mozCancelFullScreen?: () => Promise<void> }).mozCancelFullScreen) {
        await (document as unknown as { mozCancelFullScreen: () => Promise<void> }).mozCancelFullScreen();
      } else if ((document as unknown as { msExitFullscreen?: () => Promise<void> }).msExitFullscreen) {
        await (document as unknown as { msExitFullscreen: () => Promise<void> }).msExitFullscreen();
      }
    } catch (err) {
      console.warn('Exit fullscreen failed:', err);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (isFullscreen) {
      exitFullscreen();
    } else {
      enterFullscreen();
    }
  }, [isFullscreen, enterFullscreen, exitFullscreen]);

  return { isFullscreen, toggleFullscreen, enterFullscreen, exitFullscreen };
}
