type TimeFormat = "12" | "24";

/**
 * Configuration data for managing the kiosk display and behavior
 */
type KioskData = {
  debug: boolean;
  debugVerbose: boolean;
  version: string;
  langCode: string;
  params: Record<string, unknown>;
  duration: number;
  disableNavigation: boolean;
  disableScreensaver: boolean;
  showDate: boolean;
  dateFormat: string;
  showTime: boolean;
  timeFormat: TimeFormat;
  clockSource: "client" | "server";
  transition: string;
  showMoreInfo: boolean;
  showRedirects: boolean;
  livePhotos: boolean;
  livePhotoLoopDelay: number;
  burnInInterval: number;
  burnInDuration: number;
  httpTimeout: number;
  upArrowAction: string;
  downArrowAction: string;
};
