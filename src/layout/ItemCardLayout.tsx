import { cn } from "@/lib/utils";

type ItemCardProps = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

type ItemCardHeaderProps = {
  children: React.ReactNode;
  className?: string;
};

type ItemCardHeaderTitleProps = {
  children: React.ReactNode;
  className?: string;
};

type ItemCardHeaderDescriptionProps = {
  children: React.ReactNode;
  className?: string;
};

type ItemCardBodyProps = {
  children: React.ReactNode;
  className?: string;
};

const ItemCardLayout = ({ children, className, ...props }: ItemCardProps) => {
  return (
    <div
      className={cn(
        "bg-app-100 dark:bg-app-800 flex justify-between p-2 items-center rounded-lg",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const ItemCardHeader = ({ children, className }: ItemCardHeaderProps) => {
  return (
    <div className={cn("flex flex-col justify-between w-full", className)}>
      {children}
    </div>
  );
};

const ItemCardHeaderTitle = ({
  children,
  className,
}: ItemCardHeaderTitleProps) => {
  return <h2 className={cn("text-xl font-bold", className)}>{children}</h2>;
};

const ItemCardHeaderDescription = ({
  children,
  className,
}: ItemCardHeaderDescriptionProps) => {
  return (
    <p className={cn("text-muted-foreground text-sm w-5/6", className)}>
      {children}
    </p>
  );
};

const ItemCardBody = ({ children, className }: ItemCardBodyProps) => {
  return <div className={cn("mt-2", className)}>{children}</div>;
};

export default ItemCardLayout;
export {
  ItemCardHeader,
  ItemCardHeaderTitle,
  ItemCardHeaderDescription,
  ItemCardBody,
};
