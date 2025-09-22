import React from 'react';
import { motion } from 'framer-motion';

export default function HelpTOC({ headings }) {
  if (!headings || headings.length === 0) {
    return null;
  }

  return (
    <nav className="sticky top-24">
      <h3 className="text-sm font-semibold uppercase text-slate-600 mb-3">On this page</h3>
      <ul className="space-y-2">
        {headings.map((heading, index) => (
          <motion.li
            key={heading.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: index * 0.05 }}
          >
            <a
              href={`#${heading.id}`}
              className={`block text-sm transition-colors hover:text-blue-600 ${
                heading.level === 3 ? 'pl-4' : 'pl-0 font-medium'
              }`}
            >
              {heading.text}
            </a>
          </motion.li>
        ))}
      </ul>
    </nav>
  );
}