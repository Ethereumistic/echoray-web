import { TooltipProvider } from "./src/components/ui/tooltip";
import { Toaster } from "./src/components/ui/sonner";

type DesignSystemProviderProperties = {
  children: React.ReactNode;
};

export const DesignSystemProvider = ({
  children,
}: DesignSystemProviderProperties) => (
  <TooltipProvider>
    {children}
    <Toaster />
  </TooltipProvider>
);

export * from "./src/components/ui/button";
export * from "./src/components/ui/accordion";
export * from "./src/components/ui/alert-dialog";
export * from "./src/components/ui/avatar";
export * from "./src/components/ui/badge";
export * from "./src/components/ui/breadcrumb";
export * from "./src/components/ui/button-group";
export * from "./src/components/ui/calendar";
export * from "./src/components/ui/card";
export * from "./src/components/ui/carousel";
export * from "./src/components/ui/chart";
export * from "./src/components/ui/checkbox";
export * from "./src/components/ui/collapsible";
export * from "./src/components/ui/command";
export * from "./src/components/ui/dialog";
export * from "./src/components/ui/dropdown-menu";
export * from "./src/components/ui/empty";
export * from "./src/components/ui/hover-card";
export * from "./src/components/ui/input";
export * from "./src/components/ui/label";
export * from "./src/components/ui/menubar";
export * from "./src/components/ui/navigation-menu";
export * from "./src/components/ui/otp-input";
export * from "./src/components/ui/phone-input";
export * from "./src/components/ui/popover";
export * from "./src/components/ui/scroll-area";
export * from "./src/components/ui/select";
export * from "./src/components/ui/separator";
export * from "./src/components/ui/sheet";
export * from "./src/components/ui/skeleton";
export * from "./src/components/ui/sonner";
export * from "./src/components/ui/switch";
export * from "./src/components/ui/table";
export * from "./src/components/ui/tabs";
export * from "./src/components/ui/textarea";
export * from "./src/components/ui/tooltip";
export * from "./src/components/ui/upload-card";
export * from "./src/components/ui/sidebar";
