import type { ReactNode } from 'react';
import s from './Page.module.scss';

type PageProps = {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
};

export default function Page({
  eyebrow,
  title,
  description,
  actions,
  children,
}: PageProps) {
  return (
    <section className={s.page}>
      <header className={s.header}>
        {eyebrow && <p className={s.eyebrow}>{eyebrow}</p>}
        <h1 className={s.title}>{title}</h1>
        {description && <p className={s.description}>{description}</p>}
        {actions && <div className={s.actions}>{actions}</div>}
      </header>
      {children && <div className={s.body}>{children}</div>}
    </section>
  );
}
