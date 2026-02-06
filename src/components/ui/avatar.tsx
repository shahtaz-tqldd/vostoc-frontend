import * as React from "react";
import { cn } from "@/lib/utils";

// --- 1. Context for sharing state between Avatar parts ---
const AvatarContext = React.createContext<{
  imageLoadingStatus: "loading" | "loaded" | "error";
  setImageLoadingStatus: React.Dispatch<
    React.SetStateAction<"loading" | "loaded" | "error">
  >;
}>({
  imageLoadingStatus: "loading",
  setImageLoadingStatus: () => {},
});

// --- 2. The main Avatar container ---
const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const [imageLoadingStatus, setImageLoadingStatus] = React.useState<
    "loading" | "loaded" | "error"
  >("loading");

  return (
    <AvatarContext.Provider
      value={{ imageLoadingStatus, setImageLoadingStatus }}
    >
      <div
        ref={ref}
        className={cn(
          "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
          className,
        )}
        {...props}
      />
    </AvatarContext.Provider>
  );
});
Avatar.displayName = "Avatar";

// --- 3. The Avatar Image ---
interface AvatarImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  onLoadingStatusChange?: (status: "loading" | "loaded" | "error") => void;
}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ src, onLoadingStatusChange, ...props }: AvatarImageProps, ref) => {
    const context = React.useContext(AvatarContext);
    const { setImageLoadingStatus } = context;

    React.useEffect(() => {
      if (!src) {
        setImageLoadingStatus("error");
        return;
      }

      setImageLoadingStatus("loading");
    }, [src, setImageLoadingStatus]);

    const { onLoad } = props;

    const stableOnLoad = React.useCallback(
      (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
        onLoad?.(event);
      },
      [onLoad],
    );

    const handleLoad = React.useCallback(
      (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
        setImageLoadingStatus("loaded");
        onLoadingStatusChange?.("loaded");
        stableOnLoad?.(event);
      },
      [setImageLoadingStatus, onLoadingStatusChange, stableOnLoad],
    );

    const { onError } = props;

    const handleError = React.useCallback(
      (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
        setImageLoadingStatus("error");
        onLoadingStatusChange?.("error");
        onError?.(event);
      },
      [setImageLoadingStatus, onLoadingStatusChange, onError],
    );

    // Only render the image if the status is not 'error'
    if (context.imageLoadingStatus === "error") {
      return null;
    }

    return (
      <img
        ref={ref}
        className={cn(
          "aspect-square h-full w-full object-cover",
          props.className,
        )}
        src={src}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    );
  },
);
AvatarImage.displayName = "AvatarImage";

// --- 4. The Avatar Fallback ---
export interface AvatarFallbackProps extends React.HTMLAttributes<HTMLDivElement> {
  delayMs?: number;
}

const AvatarFallback = React.forwardRef<HTMLDivElement, AvatarFallbackProps>(
  ({ className, delayMs, children, ...props }, ref) => {
    const context = React.useContext(AvatarContext);
    const [canRender, setCanRender] = React.useState(delayMs === undefined);

    React.useEffect(() => {
      if (delayMs !== undefined) {
        const timer = setTimeout(() => setCanRender(true), delayMs);
        return () => clearTimeout(timer);
      }
    }, [delayMs]);

    // Only render if the image is not loaded and the delay has passed (if any)
    if (!canRender || context.imageLoadingStatus === "loaded") {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex h-full w-full items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);
AvatarFallback.displayName = "AvatarFallback";

// --- 5. Export the compound components ---
export { Avatar, AvatarImage, AvatarFallback };
