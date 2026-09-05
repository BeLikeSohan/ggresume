import React from 'react';

export interface IconProps {
  className?: string;
  size?: number;
}

export const EmailIcon: React.FC<IconProps> = ({ className = '', size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`inline-block flex-shrink-0 ${className}`}
  >
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
  </svg>
);

export const LocationIcon: React.FC<IconProps> = ({ className = '', size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`inline-block flex-shrink-0 ${className}`}
  >
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

export const GithubIcon: React.FC<IconProps> = ({ className = '', size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`inline-block flex-shrink-0 ${className}`}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

export const PhoneIcon: React.FC<IconProps> = ({ className = '', size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`inline-block flex-shrink-0 ${className}`}
  >
    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
  </svg>
);

export const GlobeIcon: React.FC<IconProps> = ({ className = '', size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block flex-shrink-0 ${className}`}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export const ExternalLinkIcon: React.FC<IconProps> = ({ className = '', size = 10 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block ml-1 opacity-70 hover:opacity-100 ${className}`}
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export const LinkedinIcon: React.FC<IconProps> = ({ className = '', size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`inline-block flex-shrink-0 ${className}`}
  >
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.74a1.65 1.65 0 0 0-1.66 1.66 1.66 1.66 0 0 0 1.66 1.65 1.65 1.65 0 0 0 1.65-1.65c0-.92-.74-1.66-1.65-1.66z" />
  </svg>
);

export const TwitterIcon: React.FC<IconProps> = ({ className = '', size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`inline-block flex-shrink-0 ${className}`}
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

export const LeetCodeIcon: React.FC<IconProps> = ({ className = '', size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`inline-block flex-shrink-0 ${className}`}
  >
    <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .666-1.795l3.86-4.133 5.398-5.78A1.377 1.377 0 0 0 13.483 0zm-2.88 7.218a1.38 1.38 0 0 0-.978 2.355l3.76 3.771H6.177a1.38 1.38 0 0 0 0 2.76h7.208l-3.76 3.771a1.38 1.38 0 1 0 1.956 1.95l6.103-6.121a1.38 1.38 0 0 0 0-1.95l-6.103-6.12a1.38 1.38 0 0 0-.978-.416z" />
  </svg>
);

export const KaggleIcon: React.FC<IconProps> = ({ className = '', size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`inline-block flex-shrink-0 ${className}`}
  >
    <path d="M18.825 23.859c-.022.08-.095.141-.184.141h-3.139a.23.23 0 0 1-.166-.073l-5.322-6.079-1.91 1.83v4.088c0 .128-.104.233-.232.233H5.232A.233.233 0 0 1 5 23.766V.234C5 .105 5.104 0 5.232 0h2.64c.128 0 .232.105.232.234v14.44l7.003-7.23a.24.24 0 0 1 .17-.075h3.314c.092 0 .167.065.185.152.022.106-.025.213-.105.282l-6.84 6.72 7.098 9.07c.074.075.115.176.096.266z" />
  </svg>
);

export const MediumIcon: React.FC<IconProps> = ({ className = '', size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`inline-block flex-shrink-0 ${className}`}
  >
    <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z" />
  </svg>
);

export const SubstackIcon: React.FC<IconProps> = ({ className = '', size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`inline-block flex-shrink-0 ${className}`}
  >
    <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
  </svg>
);

export const DevtoIcon: React.FC<IconProps> = ({ className = '', size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`inline-block flex-shrink-0 ${className}`}
  >
    <path d="M7.42 10.05c-.18-.1-.4-.15-.65-.15h-.8v4.2h.8c.25 0 .47-.05.65-.15.18-.1.32-.25.42-.44.1-.19.15-.43.15-.71v-1.04c0-.28-.05-.52-.15-.71-.1-.19-.24-.34-.42-.45zm-1.01 2.94h-.23v-1.92h.23c.27 0 .47.07.59.22.12.15.18.39.18.72 0 .34-.06.59-.18.75-.12.15-.32.23-.59.23zm6.33-1.63c-.1-.23-.25-.41-.45-.54-.2-.13-.44-.2-.72-.2H9.84v4.2h1.73c.28 0 .52-.07.72-.2.2-.13.35-.31.45-.54.1-.23.15-.51.15-.84v-1.08c0-.33-.05-.61-.15-.84zm-.63 1.9c0 .24-.04.42-.12.53-.08.11-.21.17-.38.17h-.82v-2.73h.82c.17 0 .3.06.38.17.08.11.12.29.12.53v1.33zm5.79-3.06H16.1v4.2h1.8v-.65h-1.03v-1.1h.91v-.65h-.91v-1.15h1.03v-.65zM21 4H3c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1z" />
  </svg>
);

export const DribbbleIcon: React.FC<IconProps> = ({ className = '', size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`inline-block flex-shrink-0 ${className}`}
  >
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm9.89 10.873c-.45-.04-2.88-.26-5.59.84-.13-.3-.26-.6-.4-.9-.37-.8-.78-1.58-1.22-2.32 3.19-1.4 4.54-3.17 4.67-3.35 1.57 1.51 2.54 3.53 2.54 5.73zm-3.84-6.84c-.16.2-1.46 1.83-4.52 3.14-1.44-2.48-3-4.63-3.15-4.84 1.13-.53 2.39-.83 3.72-.83 1.48 0 2.87.37 4.09 1.01l-.14.52zM8.33 3.14c.16.2 1.69 2.31 3.13 4.75-3.95 1.19-7.85 1.14-8.27 1.13C4.1 6.27 5.99 4.14 8.33 3.14zM2.05 12.08v-.26c.44.01 4.79.07 9.03-1.25.29.56.56 1.13.81 1.7-2.92.93-5.71 3.22-7.39 6.22-1.54-1.74-2.45-3.98-2.45-6.41zm3.89 7.42c1.47-2.73 3.99-4.83 6.64-5.74.88 2.29 1.25 4.52 1.34 5.15-2.44 1.15-5.18 1.41-7.98.59zm9.73-.24c-.1-.58-.45-2.65-1.28-4.84 2.53-1.08 4.75-.9 5.06-.87-.31 2.36-1.75 4.38-3.78 5.71z" />
  </svg>
);

export const BehanceIcon: React.FC<IconProps> = ({ className = '', size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`inline-block flex-shrink-0 ${className}`}
  >
    <path d="M22 7h-7v2h7V7zm1.726 10c-.442 1.297-2.029 3-4.851 3-3.535 0-5.125-2.505-5.125-5.228 0-3.084 1.956-5.272 5.093-5.272 3.399 0 4.88 2.378 4.88 5.485 0 .376-.046.883-.076 1.072h-7.324c.088 1.488 1.037 2.456 2.658 2.456 1.171 0 2.052-.519 2.47-1.513h2.275zm-7.399-3.023h4.864c-.092-1.121-.699-2.001-2.34-2.001-1.528 0-2.352.88-2.524 2.001zM0 4v16h8.847c2.32 0 4.095-.579 5.09-1.688.89-.988 1.253-2.261 1.253-3.486 0-1.729-.865-3.027-2.181-3.692 1.011-.605 1.637-1.687 1.637-3.061 0-1.077-.384-2.181-1.283-3.02C12.316 4.244 10.669 4 8.791 4H0zm3.333 3.011h4.949c.875 0 1.621.175 2.049.569.412.378.636.93.636 1.611 0 .768-.266 1.341-.758 1.706-.474.351-1.196.503-2.072.503H3.333V7.011zm0 6.023h5.362c1.047 0 1.908.196 2.404.646.477.433.734 1.075.734 1.839 0 .822-.284 1.48-.823 1.933-.53.447-1.378.658-2.485.658H3.333v-5.076z" />
  </svg>
);

export const FigmaIcon: React.FC<IconProps> = ({ className = '', size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`inline-block flex-shrink-0 ${className}`}
  >
    <path d="M12 12a4 4 0 1 1 8 0 4 4 0 0 1-8 0zm-8 4a4 4 0 0 1 4-4h4v8H8a4 4 0 0 1-4-4zm0-8a4 4 0 0 1 4-4h4v8H8a4 4 0 0 1-4-4zm8-4h4a4 4 0 1 1 0 8h-4V4zm-4 16a4 4 0 0 1 4-4v4a4 4 0 0 1-4 4 4 4 0 0 1-4-4 4 4 0 0 1 4-4z" />
  </svg>
);

export const YouTubeIcon: React.FC<IconProps> = ({ className = '', size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`inline-block flex-shrink-0 ${className}`}
  >
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export const DiscordIcon: React.FC<IconProps> = ({ className = '', size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`inline-block flex-shrink-0 ${className}`}
  >
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

export const TelegramIcon: React.FC<IconProps> = ({ className = '', size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`inline-block flex-shrink-0 ${className}`}
  >
    <path d="M12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0zm5.89 8.23l-2.02 9.53c-.15.68-.55.85-1.12.53l-3.1-2.28-1.5 1.44c-.17.17-.31.31-.63.31l.22-3.17 5.77-5.21c.25-.22-.05-.35-.39-.12L7.1 14.88l-3.08-.96c-.67-.21-.68-.67.14-.99l12.04-4.64c.56-.21 1.05.13.87.94z" />
  </svg>
);

export const StackOverflowIcon: React.FC<IconProps> = ({ className = '', size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`inline-block flex-shrink-0 ${className}`}
  >
    <path d="M18.986 21.865v-6.404h2.134V24H2.88v-8.539h2.134v6.404h13.972zM7.07 16.515l9.99 2.08.43-2.09-9.99-2.08-.43 2.09zm1.75-5.59l8.99 4.79 1.01-1.89-8.99-4.79-1.01 1.89zm3.5-5.18l6.98 7.39 1.56-1.48-6.98-7.39-1.56 1.48zM17.7 0l-1.92 1.01 5.31 9.9 1.92-1.01L17.7 0zm-10.63 20.36h10.2v-2.13H7.07v2.13z" />
  </svg>
);

export const ScholarIcon: React.FC<IconProps> = ({ className = '', size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={`inline-block flex-shrink-0 ${className}`}
  >
    <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" />
  </svg>
);

export const CodeIcon: React.FC<IconProps> = ({ className = '', size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block flex-shrink-0 ${className}`}
  >
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

export const TerminalIcon: React.FC<IconProps> = ({ className = '', size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block flex-shrink-0 ${className}`}
  >
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

export const BookIcon: React.FC<IconProps> = ({ className = '', size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block flex-shrink-0 ${className}`}
  >
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

export const PaletteIcon: React.FC<IconProps> = ({ className = '', size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block flex-shrink-0 ${className}`}
  >
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
  </svg>
);

export const LinkIcon: React.FC<IconProps> = ({ className = '', size = 12 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`inline-block flex-shrink-0 ${className}`}
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

export const GoogleIcon: React.FC<IconProps> = ({ className = '', size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    className={`inline-block flex-shrink-0 ${className}`}
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

/**
 * Universal dynamic ProfileIcon component that maps key names to the corresponding SVG icon.
 */
export const ProfileIcon: React.FC<{ icon?: string; size?: number; className?: string }> = ({
  icon = 'link',
  size = 12,
  className = '',
}) => {
  const normalized = (icon || 'link').toLowerCase().trim();

  switch (normalized) {
    case 'email':
    case 'mail':
      return <EmailIcon size={size} className={className} />;
    case 'location':
    case 'map-pin':
    case 'address':
      return <LocationIcon size={size} className={className} />;
    case 'phone':
    case 'telephone':
    case 'mobile':
      return <PhoneIcon size={size} className={className} />;
    case 'github':
    case 'git':
      return <GithubIcon size={size} className={className} />;
    case 'linkedin':
      return <LinkedinIcon size={size} className={className} />;
    case 'globe':
    case 'website':
    case 'portfolio':
    case 'web':
    case 'site':
      return <GlobeIcon size={size} className={className} />;
    case 'twitter':
    case 'x':
      return <TwitterIcon size={size} className={className} />;
    case 'leetcode':
      return <LeetCodeIcon size={size} className={className} />;
    case 'kaggle':
      return <KaggleIcon size={size} className={className} />;
    case 'medium':
      return <MediumIcon size={size} className={className} />;
    case 'substack':
      return <SubstackIcon size={size} className={className} />;
    case 'devto':
    case 'dev':
      return <DevtoIcon size={size} className={className} />;
    case 'dribbble':
      return <DribbbleIcon size={size} className={className} />;
    case 'behance':
      return <BehanceIcon size={size} className={className} />;
    case 'figma':
      return <FigmaIcon size={size} className={className} />;
    case 'youtube':
      return <YouTubeIcon size={size} className={className} />;
    case 'discord':
      return <DiscordIcon size={size} className={className} />;
    case 'telegram':
      return <TelegramIcon size={size} className={className} />;
    case 'stackoverflow':
    case 'stack-overflow':
      return <StackOverflowIcon size={size} className={className} />;
    case 'scholar':
    case 'google-scholar':
    case 'academic':
      return <ScholarIcon size={size} className={className} />;
    case 'code':
      return <CodeIcon size={size} className={className} />;
    case 'terminal':
    case 'codeforces':
    case 'hackerrank':
    case 'gitlab':
      return <TerminalIcon size={size} className={className} />;
    case 'book':
    case 'blog':
      return <BookIcon size={size} className={className} />;
    case 'palette':
    case 'art':
    case 'design':
      return <PaletteIcon size={size} className={className} />;
    case 'link':
    default:
      return <LinkIcon size={size} className={className} />;
  }
};
