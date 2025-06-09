:root {
  /* Color Palette */
  --color-bg-light: #ffffff;
  --color-bg-dark: #f8f9fa;
  --color-bg-muted: #e9ecef;
  --color-text-primary: #212529;
  --color-text-secondary: #1e293b;
  --color-accent: #007bff;
  --color-active: #1d4ed8;
  --color-border: #dee2e6;
  --color-border-muted: #cbd5e0;
  --color-disabled: #9ca3af;
  --color-shadow: rgba(0, 0, 0, 0.15);
  --color-shadow-light: rgba(0, 0, 0, 0.1);
}

igc-dockmanager {
  /* General */
  --igc-background-color: var(--color-bg-light);
  --igc-accent-color: var(--color-accent);
  --igc-active-color: var(--color-text-primary);
  --igc-border-color: var(--color-border);
  --igc-font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  --igc-dock-background: var(--color-bg-dark);
  --igc-dock-text: var(--color-text-primary);

  /* Pane & Content */
  --igc-pane-header-background: var(--color-bg-muted);
  --igc-pane-header-text: var(--color-text-primary);
  --igc-pane-content-background: var(--color-bg-light);
  --igc-pane-content-text: var(--color-text-primary);

  /* Tabs */
  --igc-tab-text: var(--color-text-primary);
  --igc-tab-background: var(--color-border-muted);
  --igc-tab-border-color: var(--color-border-muted);
  --igc-tab-text-active: var(--color-active);
  --igc-tab-background-active: #e0f2fe;
  --igc-tab-border-color-active: var(--color-active);

  /* Pinned Headers & Splitters */
  --igc-pinned-header-background: #f1f5f9;
  --igc-pinned-header-text: var(--color-text-secondary);
  --igc-splitter-background: var(--color-border-muted);
  --igc-splitter-handle: #64748b;

  /* Joystick & Floating Panes */
  --igc-flyout-shadow-color: var(--color-shadow);
  --igc-floating-pane-border-color: var(--color-border-muted);
  --igc-joystick-background: var(--color-border-muted);
  --igc-joystick-border-color: var(--color-border-muted);
  --igc-joystick-icon-color: var(--color-text-secondary);
  --igc-joystick-background-active: #bfdbfe;
  --igc-joystick-icon-color-active: var(--color-active);

  /* Buttons & Context Menus */
  --igc-button-text: var(--color-text-secondary);
  --igc-context-menu-background: var(--color-bg-light);
  --igc-context-menu-background-active: #e0f2fe;
  --igc-context-menu-color: var(--color-text-secondary);
  --igc-context-menu-color-active: var(--color-active);
  --igc-drop-shadow-background: var(--color-shadow-light);
  --igc-disabled-color: var(--color-disabled);
}
