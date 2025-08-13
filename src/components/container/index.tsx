import { cn } from "@/lib/utils";

export default function Container({
  children,
  verticalPadding = true,
}: {
  children: React.ReactNode;
  verticalPadding?: boolean;
}) {
  return (
    <div className={cn("container mx-auto px-4", verticalPadding && "py-8")}>
      {children}
    </div>
  );
}
