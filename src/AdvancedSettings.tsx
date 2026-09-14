import type { ReactNode } from 'react';
import type { Messages } from './i18n';

export default function AdvancedSettings({ copy, children }: { copy: Messages; children: ReactNode }) {
  return <details className="inspector-advanced"><summary>{copy.inspectorAdvanced}</summary><div className="inspector-advanced-content">{children}</div></details>;
}
