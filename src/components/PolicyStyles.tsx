
import React from 'react';
import { cn } from '@/lib/utils';

// Reusable policy section component
export const PolicySection: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, children, className }) => (
  <section className={cn("mb-8", className)}>
    <h2 className="text-2xl font-bold mb-4 text-market-purple">{title}</h2>
    <div className="space-y-4">
      {children}
    </div>
  </section>
);

// Reusable policy subsection component
export const PolicySubsection: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
}> = ({ title, children, className }) => (
  <div className={cn("mb-6", className)}>
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <div className="space-y-3">
      {children}
    </div>
  </div>
);

// Reusable paragraph component
export const PolicyParagraph: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <p className={cn("text-gray-300 leading-relaxed", className)}>
    {children}
  </p>
);

// Reusable list component
export const PolicyList: React.FC<{
  items: React.ReactNode[];
  ordered?: boolean;
  className?: string;
}> = ({ items, ordered = false, className }) => {
  const ListComponent = ordered ? 'ol' : 'ul';
  
  return (
    <ListComponent className={cn(
      "pl-6 space-y-2 text-gray-300",
      ordered ? "list-decimal" : "list-disc",
      className
    )}>
      {items.map((item, index) => (
        <li key={index} className="leading-relaxed">{item}</li>
      ))}
    </ListComponent>
  );
};

// Reusable link component
export const PolicyLink: React.FC<{
  href: string;
  children: React.ReactNode;
  external?: boolean;
  className?: string;
}> = ({ href, children, external = false, className }) => (
  <a 
    href={href}
    className={cn("text-market-purple hover:text-market-orange underline transition-colors", className)}
    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
  >
    {children}
  </a>
);

// Reusable emphasis component
export const PolicyEmphasis: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => (
  <strong className={cn("font-semibold text-market-light-purple", className)}>
    {children}
  </strong>
);


export const PolicyTable: React.FC<{ headers, rows }> = ({ headers, rows }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-md">
        <thead className="bg-purple-600 text-white">
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
        <tbody className="divide-y divide-gray-200">
          {rows.map((row, rowIndex) => (
            <tr 
              key={`row-${rowIndex}`}
              className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            >
              {row.map((cell, cellIndex) => (
                <td 
                  key={`cell-${rowIndex}-${cellIndex}`}
                  className="px-6 py-4 text-sm text-gray-700 whitespace-normal"
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
}