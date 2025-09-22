// Global type declarations to resolve module errors
declare module 'react' {
  export * from 'react';
}

declare module 'next/link' {
  import { ComponentType } from 'react';
  interface LinkProps {
    href: string;
    prefetch?: boolean;
    children?: React.ReactNode;
    className?: string;
    asChild?: boolean;
  }
  const Link: ComponentType<LinkProps>;
  export default Link;
}

declare module 'next/navigation' {
  export function useRouter(): {
    push: (href: string) => void;
    replace: (href: string) => void;
    back: () => void;
    forward: () => void;
    refresh: () => void;
  };
  
  export function usePathname(): string;
  
  export function useSearchParams(): URLSearchParams;
}

declare module 'next-themes' {
  export function useTheme(): {
    theme: string | undefined;
    setTheme: (theme: string) => void;
  };
}

declare module 'lucide-react' {
  import { ComponentType, SVGProps } from 'react';
  
  export const Bell: ComponentType<SVGProps<SVGSVGElement>>;
  export const Heart: ComponentType<SVGProps<SVGSVGElement>>;
  export const User: ComponentType<SVGProps<SVGSVGElement>>;
  export const Settings: ComponentType<SVGProps<SVGSVGElement>>;
  export const Moon: ComponentType<SVGProps<SVGSVGElement>>;
  export const Sun: ComponentType<SVGProps<SVGSVGElement>>;
  export const LogOut: ComponentType<SVGProps<SVGSVGElement>>;
  export const Home: ComponentType<SVGProps<SVGSVGElement>>;
  export const MessageCircle: ComponentType<SVGProps<SVGSVGElement>>;
  export const Star: ComponentType<SVGProps<SVGSVGElement>>;
  export const Image: ComponentType<SVGProps<SVGSVGElement>>;
  export const Calendar: ComponentType<SVGProps<SVGSVGElement>>;
  export const BarChart3: ComponentType<SVGProps<SVGSVGElement>>;
  export const TrendingUp: ComponentType<SVGProps<SVGSVGElement>>;
  export const MoreHorizontal: ComponentType<SVGProps<SVGSVGElement>>;
  export const Plus: ComponentType<SVGProps<SVGSVGElement>>;
  export const Crown: ComponentType<SVGProps<SVGSVGElement>>;
  export const Shield: ComponentType<SVGProps<SVGSVGElement>>;
  export const Sparkles: ComponentType<SVGProps<SVGSVGElement>>;
  export const HardDrive: ComponentType<SVGProps<SVGSVGElement>>;
  export const Users: ComponentType<SVGProps<SVGSVGElement>>;
  export const Video: ComponentType<SVGProps<SVGSVGElement>>;
  export const MessageSquare: ComponentType<SVGProps<SVGSVGElement>>;
  export const Zap: ComponentType<SVGProps<SVGSVGElement>>;
  export const Play: ComponentType<SVGProps<SVGSVGElement>>;
  export const X: ComponentType<SVGProps<SVGSVGElement>>;
  export const Save: ComponentType<SVGProps<SVGSVGElement>>;
  export const ArrowLeft: ComponentType<SVGProps<SVGSVGElement>>;
  export const ArrowRight: ComponentType<SVGProps<SVGSVGElement>>;
  export const MapPin: ComponentType<SVGProps<SVGSVGElement>>;
  export const MessageCircle: ComponentType<SVGProps<SVGSVGElement>>;
}

declare module '@dataconnect/generated' {
  export * from '@dataconnect/generated';
}
