import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-4">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <h2 className="text-xl font-heading font-bold">Algo salió mal</h2>
          <p className="text-muted-foreground text-center max-w-md">
            Ocurrió un error inesperado. Por favor intenta de nuevo.
          </p>
          {process.env.NODE_ENV === "development" && (
            <pre className="text-xs bg-muted p-3 rounded max-w-full overflow-auto">
              {this.state.error?.message}
            </pre>
          )}
          <Button
            variant="default"
            onClick={() => window.location.reload()}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Recargar página
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
