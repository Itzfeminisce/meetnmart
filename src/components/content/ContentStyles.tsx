import React from 'react';
import { cn } from '@/lib/utils';

export const ContentSection: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, children, className }) => (
  <section className={cn("mb-8", className)}>
    <h2 className="text-2xl font-bold mb-4 text-accent-primary">{title}</h2>
    <div className="space-y-4">{children}</div>
  </section>
);

export const ContentSubsection: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, children, className }) => (
  <div className={cn("mb-6", className)}>
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
);

export const ContentText: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <p className={cn("text-content-secondary leading-relaxed", className)}>
    {children}
  </p>
);

export const ContentList: React.FC<{
  items: React.ReactNode[];
  ordered?: boolean;
  className?: string;
}> = ({ items, ordered = false, className }) => {
  const ListComponent = ordered ? 'ol' : 'ul';
  return (
    <ListComponent className={cn(
      "pl-6 space-y-2 text-content-secondary",
      ordered ? "list-decimal" : "list-disc",
      className
    )}>
      {items.map((item, index) => (
        <li key={index} className="leading-relaxed">{item}</li>
      ))}
    </ListComponent>
  );
};

export const ContentLink: React.FC<{
  href: string;
  children: React.ReactNode;
  external?: boolean;
  className?: string;
}> = ({ href, children, external = false, className }) => (
  <a 
    href={href}
    className={cn("text-accent-primary hover:text-accent-secondary underline transition-colors", className)}
    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
  >
    {children}
  </a>
);

export const ContentHighlight: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <strong className={cn("font-semibold text-accent-tertiary", className)}>
    {children}
  </strong>
);

export const ContentTable: React.FC<{ 
  headers: React.ReactNode[],
  rows: React.ReactNode[][],
  className?: string 
}> = ({ headers, rows, className }) => (
  <div className={cn("w-full overflow-x-auto", className)}>
    <table className="w-full border-collapse bg-background-secondary rounded-lg overflow-hidden shadow-md">
      <thead className="bg-accent-primary text-white">
        <tr>
          {headers.map((header, index) => (
            <th 
              key={`header-${index}`}
              className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-divider">
        {rows.map((row, rowIndex) => (
          <tr 
            key={`row-${rowIndex}`}
            className={rowIndex % 2 === 0 ? 'bg-background-secondary' : 'bg-background-tertiary'}
          >
            {row.map((cell, cellIndex) => (
              <td 
                key={`cell-${rowIndex}-${cellIndex}`}
                className="px-6 py-4 text-sm text-content-primary whitespace-normal"
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);