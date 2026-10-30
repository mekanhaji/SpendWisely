import { ChevronRight, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type SettingsSectionProps = {
  title: string;
  children: React.ReactNode;
};

/** A titled group of rows on one card, divided by hairlines. */
export const SettingsSection = ({ title, children }: SettingsSectionProps) => (
  <section className="flex flex-col gap-2">
    <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {title}
    </h2>
    <Card className="divide-y overflow-hidden">{children}</Card>
  </section>
);

type SettingsRowProps = {
  title: string;
  description?: string;
  /** Control shown on the right (input, switcher, button...). */
  children?: React.ReactNode;
  /** `id` of the control, so the title is its accessible label. */
  htmlFor?: string;
  /** Makes the whole row a button, with a chevron. */
  onClick?: () => void;
  /** Makes the whole row an external link. */
  href?: string;
  disabled?: boolean;
};

const rowClass =
  "flex min-h-14 w-full items-center gap-3 px-4 py-3 text-left";

const interactiveClass =
  "transition-colors hover:bg-accent/60 active:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";

export const SettingsRow = ({
  title,
  description,
  children,
  htmlFor,
  onClick,
  href,
  disabled,
}: SettingsRowProps) => {
  const text = (
    <span className="min-w-0 flex-1">
      {htmlFor ? (
        <label htmlFor={htmlFor} className="block font-medium">
          {title}
        </label>
      ) : (
        <span className="block font-medium">{title}</span>
      )}
      {description && (
        <span className="block text-sm text-muted-foreground">
          {description}
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(rowClass, interactiveClass)}
      >
        {text}
        <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
      </a>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(rowClass, interactiveClass)}
      >
        {text}
        {children}
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>
    );
  }

  return (
    <div className={rowClass}>
      {text}
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
};
