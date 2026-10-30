import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Drawer as DrawerPrimitive } from "vaul";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";
import { DESKTOP_QUERY, useMediaQuery } from "@/hooks/useMediaQuery";

/**
 * One API, two looks. Phones get a bottom sheet (vaul); from the `md`
 * breakpoint up the same pieces render as a centered dialog (Radix). Each
 * piece below picks the matching library's component, so the two never mix.
 */
const SheetModeContext = React.createContext(false);

type DrawerProps = {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
};

const Drawer = ({ open, onOpenChange, children }: DrawerProps) => {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const Root = isDesktop ? DialogPrimitive.Root : DrawerPrimitive.Root;

  return (
    <SheetModeContext.Provider value={isDesktop}>
      <Root open={open} onOpenChange={onOpenChange}>
        {children}
      </Root>
    </SheetModeContext.Provider>
  );
};
Drawer.displayName = "Drawer";

/** Picks the Radix (desktop) or vaul (phone) version of a Dialog part. */
const useSheetPart = <T,>(desktop: T, phone: T): T =>
  React.useContext(SheetModeContext) ? desktop : phone;

const DrawerTrigger = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>
>((props, ref) => {
  const Trigger = useSheetPart<typeof DialogPrimitive.Trigger>(
    DialogPrimitive.Trigger,
    DrawerPrimitive.Trigger,
  );
  return <Trigger ref={ref} {...props} />;
});
DrawerTrigger.displayName = "DrawerTrigger";

const DrawerClose = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>
>((props, ref) => {
  const Close = useSheetPart<typeof DialogPrimitive.Close>(
    DialogPrimitive.Close,
    DrawerPrimitive.Close,
  );
  return <Close ref={ref} {...props} />;
});
DrawerClose.displayName = "DrawerClose";

const DrawerContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  const isDesktop = React.useContext(SheetModeContext);

  if (isDesktop) {
    return (
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            "fixed left-[50%] top-[50%] z-50 flex max-h-[90dvh] w-full max-w-md translate-x-[-50%] translate-y-[-50%] flex-col rounded-2xl border bg-background shadow-float outline-none duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
            className,
          )}
          {...props}
        >
          <div className="flex flex-col gap-4 overflow-y-auto p-6">
            {children}
          </div>
          {/* Last in the DOM, so the first field (not this button) takes focus
              when a dialog opens. */}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    );
  }

  return (
    <DrawerPrimitive.Portal>
      <DrawerPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
      <DrawerPrimitive.Content
        ref={ref}
        className={cn(
          "fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92dvh] w-full max-w-[625px] flex-col rounded-t-3xl border border-b-0 bg-background shadow-float outline-none",
          className,
        )}
        {...props}
      >
        <div
          aria-hidden="true"
          className="mx-auto mt-3 h-1.5 w-10 shrink-0 rounded-full bg-muted-foreground/30"
        />
        <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
          {children}
        </div>
      </DrawerPrimitive.Content>
    </DrawerPrimitive.Portal>
  );
});
DrawerContent.displayName = "DrawerContent";

// pr-8 on desktop keeps long titles clear of the dialog's close button.
const DrawerHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-1 md:pr-8", className)} {...props} />
);
DrawerHeader.displayName = "DrawerHeader";

const DrawerFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col gap-2", className)} {...props} />
);
DrawerFooter.displayName = "DrawerFooter";

const DrawerTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => {
  const Title = useSheetPart<typeof DialogPrimitive.Title>(
    DialogPrimitive.Title,
    DrawerPrimitive.Title,
  );
  return (
    <Title
      ref={ref}
      className={cn("text-lg font-semibold leading-tight", className)}
      {...props}
    />
  );
});
DrawerTitle.displayName = "DrawerTitle";

const DrawerDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => {
  const Description = useSheetPart<typeof DialogPrimitive.Description>(
    DialogPrimitive.Description,
    DrawerPrimitive.Description,
  );
  return (
    <Description
      ref={ref}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
});
DrawerDescription.displayName = "DrawerDescription";

export {
  Drawer,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
