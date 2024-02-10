import { Loader2 } from "lucide-react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function ToastContainer({ ...props }: ToasterProps): JSX.Element {
  return (
    <Sonner
      theme="light"
      className="toast"
      expand={true}
      loadingIcon={<Loader2 className="w-4 h-4 animate-pulse" />}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: "alert h-14",
          success: "alert-success",
          info: "alert-info",
          warning: "alert-warning",
          error: "alert-error",
        },
      }}
      {...props}
    />
  );
}
