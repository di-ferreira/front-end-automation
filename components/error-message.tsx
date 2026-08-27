interface ErrorMessageProps {
  message?: string | null;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="text-destructive bg-destructive/10 rounded-lg px-3 py-2 text-sm font-medium"
    >
      {message}
    </p>
  );
}
