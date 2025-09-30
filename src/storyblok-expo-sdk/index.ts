import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from 'react';
import type { StoryblokConfig, StoryblokStory, StoryblokEvent, StoryblokContextType, StoryblokEventType } from './types';
import React from 'react';

let Text: any;
let View: any;

try {
  const RN = require('react-native');
  Text = RN.Text;
  View = RN.View;
} catch (e) {
  Text = 'span';
  View = 'div';
}

declare global {
  interface Window {
    StoryblokBridge: any;
    sbBridge: any;
  }
}

const StoryblokContext = createContext<StoryblokContextType | null>(null);

interface StoryblokProviderProps {
  children: ReactNode;
  config: StoryblokConfig;
  storySlug?: string;
  router?: any;
  components?: Record<string, React.ComponentType<any>>;
}

interface StoryblokOptions {
  config: StoryblokConfig;
  components?: Record<string, React.ComponentType<any>>;
}

// Global component registry
let globalComponents: Record<string, React.ComponentType<any>> = {};

export class StoryblokSDK {
  private config: StoryblokConfig;
  private bridge: any = null;
  private callbacks: Map<string, Function[]> = new Map();
  private router: any = null;
  private isInEditor: boolean = false;
  private originalUrl: string = '';
  private cleanPathname: string = '';
  private urlCleanupInterval: ReturnType<typeof setInterval> | null = null;
  private components: Record<string, React.ComponentType<any>> = {};
  private isWebEnvironment: boolean = false;

  constructor(config: StoryblokConfig, router?: any, components?: Record<string, React.ComponentType<any>>) {
    this.config = config;
    this.router = router;
    this.components = components || {};

    // Check if we're in a web environment
    this.isWebEnvironment = typeof window !== 'undefined' &&
      typeof window.history !== 'undefined' &&
      typeof window.history.pushState === 'function';

    // Only check for editor mode in web environments
    this.isInEditor = this.isWebEnvironment && window.self !== window.top;

    if (this.config.debug) {
      console.log('[Storyblok SDK] Environment detected:', {
        isWeb: this.isWebEnvironment,
        isInEditor: this.isInEditor,
        hasHistory: typeof window !== 'undefined' && typeof window.history !== 'undefined',
        platform: typeof window !== 'undefined' ? 'web' : 'native'
      });
    }

    if (this.isInEditor && this.isWebEnvironment) {
      this.initializeExpoRouterIntegration();
    } else if (this.config.debug) {
      if (!this.isWebEnvironment) {
        console.log('[Storyblok SDK] Native environment detected - skipping browser-specific features');
      } else {
        console.log('[Storyblok SDK] Not in editor mode - skipping editor integration');
      }
    }
  }

  // Component registration methods
  registerComponent(name: string, component: React.ComponentType<any>): void {
    this.components[name] = component;
    globalComponents[name] = component;

    if (this.config.debug) {
      console.log(`[Storyblok SDK] Registered component: ${name}`);
    }
  }

  registerComponents(components: Record<string, React.ComponentType<any>>): void {
    Object.entries(components).forEach(([name, component]) => {
      this.registerComponent(name, component);
    });

    if (this.config.debug) {
      console.log(`[Storyblok SDK] Registered ${Object.keys(components).length} components:`, Object.keys(components));
    }
  }

  getComponent(name: string): React.ComponentType<any> | null {
    const component = this.components[name] || globalComponents[name] || null;

    if (!component && this.config.debug) {
      console.warn(`[Storyblok SDK] Component "${name}" not found in registry`);
    }

    return component;
  }

  // Render Storyblok content with registered components
  renderStoryblokContent(content: any, key?: string): React.ReactNode {
    if (!content) {
      if (this.config.debug) {
        console.log('[Storyblok SDK] No content to render');
      }
      return null;
    }

    // If content is an array, render each item
    if (Array.isArray(content)) {
      if (this.config.debug) {
        console.log(`[Storyblok SDK] Rendering array content with ${content.length} items`);
      }

      return content.map((item, index) =>
        this.renderStoryblokContent(item, `${key || 'item'}-${index}`)
      );
    }

    // If content has a component field, try to render it
    if (content.component) {
      const Component = this.getComponent(content.component);

      if (Component) {
        const props = {
          ...content,
          key: key || content._uid || `component-${Math.random()}`,
          blok: content, // Pass the whole blok as a prop (Next.js style)
          _editable: content._editable, // Pass editable info for visual editing
        };

        if (this.config.debug) {
          console.log(`[Storyblok SDK] Rendering component: ${content.component}`, { props: Object.keys(props) });
        }

        return React.createElement(Component, props);
      } else {
        // Component not found, render a placeholder or warning
        if (this.config.debug) {
          console.warn(`[Storyblok SDK] Component "${content.component}" not registered`);
        }

        return React.createElement(
          View,
          {
            key: key || content._uid,
            style: {
              borderColor: '#ff6b6b',
              borderWidth: 2,
              borderStyle: 'dashed',
              padding: 16,
              margin: 8,
              backgroundColor: '#fff5f5',
              borderRadius: 4
            }
          },
          React.createElement(Text, { style: { color: '#ff6b6b' } },
            `Component "${content.component}" not found`
          )
        );
      }
    }

    // If content is an object with nested content, recursively render
    if (typeof content === 'object') {
      const renderedContent: any = {};

      Object.entries(content).forEach(([key, value]) => {
        if (Array.isArray(value) && value.some(item => item?.component)) {
          renderedContent[key] = this.renderStoryblokContent(value, key);
        } else if (value && typeof value === 'object' && value.component) {
          renderedContent[key] = this.renderStoryblokContent(value, key);
        } else {
          renderedContent[key] = value;
        }
      });

      return renderedContent;
    }

    return content;
  }

  private initializeExpoRouterIntegration(): void {
    if (!this.isWebEnvironment) {
      if (this.config.debug) {
        console.warn('[Storyblok SDK] Cannot initialize Expo router integration - not in web environment');
      }
      return;
    }

    this.originalUrl = window.location.origin + window.location.pathname;
    this.cleanPathname = window.location.pathname;

    if (this.config.debug) {
      console.log('[Storyblok SDK] Initializing Expo router integration', {
        originalUrl: this.originalUrl,
        cleanPathname: this.cleanPathname
      });
    }

    this.cleanStoryblokParams();
    this.urlCleanupInterval = setInterval(() => {
      this.cleanStoryblokParams();
    }, 100);

    this.setupHistoryInterception();
  }

  private cleanStoryblokParams(): void {
    if (!this.isWebEnvironment) return;

    const currentUrl = new URL(window.location.href);
    let hasStoryblokParams = false;

    for (const key of currentUrl.searchParams.keys()) {
      if (key.startsWith('_storyblok')) {
        currentUrl.searchParams.delete(key);
        hasStoryblokParams = true;
      }
    }

    if (hasStoryblokParams) {
      const cleanUrl = currentUrl.pathname + (currentUrl.search || '');

      window.history.replaceState(
        window.history.state,
        document.title,
        cleanUrl
      );

      if (this.config.debug) {
        console.log('[Storyblok SDK] Cleaned URL from Storyblok parameters:', cleanUrl);
      }
    }
  }

  private setupHistoryInterception(): void {
    if (!this.isWebEnvironment) {
      if (this.config.debug) {
        console.warn('[Storyblok SDK] Cannot setup history interception - not in web environment');
      }
      return;
    }

    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    if (this.config.debug) {
      console.log('[Storyblok SDK] Setting up history interception');
    }

    window.history.pushState = (state: any, title: string, url?: string | URL) => {
      if (url && typeof url === 'string' && this.shouldInterceptUrl(url)) {
        const cleanUrl = this.removeStoryblokParamsFromUrl(url);

        if (this.config.debug) {
          console.log('[Storyblok SDK] Intercepted pushState:', { original: url, clean: cleanUrl });
        }

        return originalPushState.call(window.history, state, title, cleanUrl);
      }
      return originalPushState.call(window.history, state, title, url);
    };

    window.history.replaceState = (state: any, title: string, url?: string | URL) => {
      if (url && typeof url === 'string' && this.shouldInterceptUrl(url)) {
        const cleanUrl = this.removeStoryblokParamsFromUrl(url);

        if (this.config.debug) {
          console.log('[Storyblok SDK] Intercepted replaceState:', { original: url, clean: cleanUrl });
        }

        return originalReplaceState.call(window.history, state, title, cleanUrl);
      }
      return originalReplaceState.call(window.history, state, title, url);
    };

    window.addEventListener('popstate', () => {
      setTimeout(() => this.cleanStoryblokParams(), 10);
    });
  }

  private shouldInterceptUrl(url: string): boolean {
    return url.includes('_storyblok');
  }

  private removeStoryblokParamsFromUrl(url: string): string {
    try {
      const urlObj = new URL(url, window.location.origin);

      for (const key of Array.from(urlObj.searchParams.keys())) {
        if (key.startsWith('_storyblok')) {
          urlObj.searchParams.delete(key);
        }
      }

      return urlObj.pathname + (urlObj.search || '');
    } catch (error) {
      if (this.config.debug) {
        console.warn('[Storyblok SDK] Failed to parse URL:', url, error);
      }
      return url;
    }
  }

  async loadBridge(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        const message = 'Window object not available - bridge loading skipped in native environment';
        if (this.config.debug) {
          console.warn(`[Storyblok SDK] ${message}`);
        }
        reject(new Error(message));
        return;
      }

      if (window.StoryblokBridge) {
        if (this.config.debug) {
          console.log('[Storyblok SDK] Bridge already loaded, initializing');
        }
        this.initializeBridge();
        resolve(true);
        return;
      }

      if (this.config.debug) {
        console.log('[Storyblok SDK] Loading Storyblok bridge script');
      }

      const script = document.createElement('script');
      script.src = 'https://app.storyblok.com/f/storyblok-v2-latest.js';
      script.async = true;

      script.onload = () => {
        if (this.config.debug) {
          console.log('[Storyblok SDK] Bridge script loaded successfully');
        }
        this.initializeBridge();
        resolve(true);
      };

      script.onerror = () => {
        const message = 'Failed to load Storyblok Bridge script';
        if (this.config.debug) {
          console.error(`[Storyblok SDK] ${message}`);
        }
        reject(new Error(message));
      };

      document.head.appendChild(script);
    });
  }

  private initializeBridge(): void {
    if (!window.StoryblokBridge) {
      throw new Error('StoryblokBridge not available');
    }

    if (this.config.debug) {
      console.log('[Storyblok SDK] Initializing bridge');
    }

    this.bridge = new window.StoryblokBridge();
    window.sbBridge = this.bridge;

    const events: StoryblokEventType[] = [
      'input', 'change', 'published', 'unpublished', 'viewLiveVersion',
      'enterEditmode', 'enterComponent', 'hoverComponent', 'highlightComponent',
      'customEvent', 'pingBack', 'sessionReceived', 'editedBlok', 'deselectBlok',
      'addedBlock', 'deletedBlock', 'movedBlock', 'duplicatedBlock'
    ];

    events.forEach(event => {
      this.bridge.on(event, (data: any) => {
        if (this.isInEditor && this.isWebEnvironment) {
          setTimeout(() => this.cleanStoryblokParams(), 10);
        }

        this.emit(event, data);
        if (this.config.debug) {
          console.log(`[Storyblok SDK] Event: ${event}`, data);
        }
      });
    });

    this.bridge.on('viewLiveVersion', () => {
      if (this.router && this.cleanPathname) {
        if (this.config.debug) {
          console.log('[Storyblok SDK] Navigating to live version:', this.cleanPathname);
        }
        this.router.replace(this.cleanPathname);
      }
    });

    if (this.config.debug) {
      console.log(`[Storyblok SDK] Bridge initialized with ${events.length} event listeners`);
    }
  }

  on(event: string, callback: Function): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)!.push(callback);

    if (this.config.debug) {
      console.log(`[Storyblok SDK] Added event listener for: ${event}`);
    }
  }

  off(event: string, callback: Function): void {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
        if (this.config.debug) {
          console.log(`[Storyblok SDK] Removed event listener for: ${event}`);
        }
      }
    }
  }

  private emit(event: string, data: any): void {
    const callbacks = this.callbacks.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  async fetchStory(slug: string, version: 'draft' | 'published' = 'draft'): Promise<StoryblokStory> {
    const apiUrl = `https://api${this.config.region === 'us' ? '-us' : ''}.storyblok.com/v2/cdn/stories/${slug}?token=${this.config.token}&version=${version}`;

    if (this.config.debug) {
      console.log(`[Storyblok SDK] Fetching story: ${slug} (${version})`);
    }

    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorMessage = `Failed to fetch story "${slug}": ${response.statusText}`;
      if (this.config.debug) {
        console.error(`[Storyblok SDK] ${errorMessage}`);
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();

    if (this.config.debug) {
      console.log(`[Storyblok SDK] Successfully fetched story: ${slug}`, {
        contentType: data.story?.content?.component,
        hasContent: !!data.story?.content
      });
    }

    return data.story;
  }

  isInStoryblokEditor(): boolean {
    return this.isInEditor;
  }

  destroy(): void {
    if (this.config.debug) {
      console.log('[Storyblok SDK] Destroying SDK instance');
    }

    this.callbacks.clear();

    if (this.urlCleanupInterval) {
      clearInterval(this.urlCleanupInterval);
      this.urlCleanupInterval = null;
    }

    if (window.sbBridge) {
      delete window.sbBridge;
    }
  }

  getCleanPathname(): string {
    return this.cleanPathname;
  }

  navigate(path: string, options?: any): void {
    if (this.router) {
      const cleanPath = this.removeStoryblokParamsFromUrl(path);

      if (this.config.debug) {
        console.log('[Storyblok SDK] Navigating to:', { original: path, clean: cleanPath });
      }

      this.router.push(cleanPath, options);
    } else if (this.config.debug) {
      console.warn('[Storyblok SDK] Cannot navigate - no router provided');
    }
  }
}

// Enhanced StoryblokProvider with component support
export function StoryblokProvider({
  children,
  config,
  storySlug = 'home',
  router,
  components = {}
}: StoryblokProviderProps) {
  const [sdk] = useState(() => {
    if (config.debug) {
      console.log('[Storyblok SDK] Creating SDK instance with config:', {
        token: config.token ? 'present' : 'missing',
        region: config.region,
        debug: config.debug,
        componentsCount: Object.keys(components).length
      });
    }

    const sdkInstance = new StoryblokSDK(config, router, components);
    // Register components globally
    sdkInstance.registerComponents(components);
    return sdkInstance;
  });

  const [draftContent, setDraftContent] = useState<StoryblokStory | null>(null);
  const [publishedContent, setPublishedContent] = useState<StoryblokStory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventCount, setEventCount] = useState(0);
  const [isInEditor, setIsInEditor] = useState(false);
  const initializationRef = useRef(false);

  const refreshContent = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (config.debug) {
        console.log(`[Storyblok SDK] Refreshing content for story: ${storySlug}`);
      }

      const [draft, published] = await Promise.all([
        sdk.fetchStory(storySlug, 'draft').catch((err) => {
          if (config.debug) {
            console.warn(`[Storyblok SDK] Failed to fetch draft for ${storySlug}:`, err.message);
          }
          return null;
        }),
        sdk.fetchStory(storySlug, 'published').catch((err) => {
          if (config.debug) {
            console.warn(`[Storyblok SDK] Failed to fetch published for ${storySlug}:`, err.message);
          }
          return null;
        })
      ]);

      setDraftContent(draft);
      setPublishedContent(published);

      if (config.debug) {
        console.log(`[Storyblok SDK] Content refreshed for ${storySlug}:`, {
          hasDraft: !!draft,
          hasPublished: !!published
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      if (config.debug) {
        console.error('[Storyblok SDK] Error refreshing content:', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [sdk, storySlug, config.debug]);

  useEffect(() => {
    if (initializationRef.current) return;
    initializationRef.current = true;

    setIsInEditor(sdk.isInStoryblokEditor());

    const initializeSDK = async () => {
      try {
        if (config.debug) {
          console.log('[Storyblok SDK] Starting initialization');
        }

        await sdk.loadBridge();
        await refreshContent();

        sdk.on('input', (data: any) => {
          if (data && data.story) {
            if (config.debug) {
              console.log('[Storyblok SDK] Input event received, updating draft content');
            }
            setDraftContent(data.story);
            setEventCount(prev => prev + 1);
          }
        });

        sdk.on('published', async () => {
          if (config.debug) {
            console.log('[Storyblok SDK] Published event received, refreshing content');
          }
          setEventCount(prev => prev + 1);
          await refreshContent();
        });

        const events: StoryblokEventType[] = [
          'change', 'unpublished', 'viewLiveVersion', 'enterEditmode',
          'enterComponent', 'hoverComponent', 'highlightComponent',
          'customEvent', 'pingBack', 'sessionReceived', 'editedBlok',
          'deselectBlok', 'addedBlock', 'deletedBlock', 'movedBlock',
          'duplicatedBlock'
        ];

        events.forEach(event => {
          sdk.on(event, () => {
            setEventCount(prev => prev + 1);
          });
        });

        if (config.debug) {
          console.log('[Storyblok SDK] Initialization complete');
        }

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize SDK';
        setError(errorMessage);
        if (config.debug) {
          console.error('[Storyblok SDK] Initialization error:', errorMessage);
        }
      }
    };

    initializeSDK();

    return () => {
      if (config.debug) {
        console.log('[Storyblok SDK] Cleaning up provider');
      }
      sdk.destroy();
    };
  }, [sdk, refreshContent, config.debug]);

  const contextValue: StoryblokContextType = {
    draftContent,
    publishedContent,
    isInEditor,
    isLoading,
    error,
    eventCount,
    refreshContent,
    sdk,
    // Add render method to context
    renderContent: sdk.renderStoryblokContent.bind(sdk),
  };

  return React.createElement(
    StoryblokContext.Provider,
    { value: contextValue },
    children
  );
}

export function useStoryblok(): StoryblokContextType {
  const context = useContext(StoryblokContext);
  if (!context) {
    throw new Error('useStoryblok must be used within a StoryblokProvider');
  }
  return context;
}

// Storyblok initialization function (similar to Next.js)
export function storyblokInit(options: StoryblokOptions) {
  const { config, components = {} } = options;

  if (config.debug) {
    console.log('[Storyblok SDK] Initializing with components:', Object.keys(components));
  }

  // Register components globally
  globalComponents = { ...globalComponents, ...components };

  return {
    // Create SDK instance
    createSDK: (router?: any) => new StoryblokSDK(config, router, components),

    // Get registered components
    getComponents: () => globalComponents,

    // Register additional components
    registerComponent: (name: string, component: React.ComponentType<any>) => {
      globalComponents[name] = component;
      if (config.debug) {
        console.log(`[Storyblok SDK] Registered component globally: ${name}`);
      }
    },

    // Register multiple components
    registerComponents: (newComponents: Record<string, React.ComponentType<any>>) => {
      Object.assign(globalComponents, newComponents);
      if (config.debug) {
        console.log(`[Storyblok SDK] Registered ${Object.keys(newComponents).length} components globally:`, Object.keys(newComponents));
      }
    }
  };
}

// Storyblok editable wrapper component
interface StoryblokEditableProps {
  content: any;
  children: React.ReactNode;
}

export function StoryblokEditable({ content, children }: StoryblokEditableProps) {
  const editableProps = content._editable
    ? { dangerouslySetInnerHTML: { __html: content._editable } }
    : {};

  return React.createElement(View, editableProps, children);
}

// Hook for rendering Storyblok content
export function useStoryblokContent() {
  const { sdk, draftContent, publishedContent, isInEditor } = useStoryblok();

  const currentContent = isInEditor ? draftContent : publishedContent;

  const renderContent = useCallback((content?: any) => {
    const contentToRender = content || currentContent?.content;
    return sdk?.renderStoryblokContent(contentToRender);
  }, [sdk, currentContent]);

  return {
    content: currentContent,
    draftContent,
    publishedContent,
    isInEditor,
    renderContent,
  };
}

export function useStoryblokStory(slug: string) {
  const { sdk, isInEditor } = useStoryblok();
  const [draftContent, setDraftContent] = useState<StoryblokStory | null>(null);
  const [publishedContent, setPublishedContent] = useState<StoryblokStory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    if (!sdk) return;

    try {
      setIsLoading(true);
      setError(null);

      const [draft, published] = await Promise.all([
        sdk.fetchStory(slug, 'draft').catch(() => null),
        sdk.fetchStory(slug, 'published').catch(() => null)
      ]);

      setDraftContent(draft);
      setPublishedContent(published);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error(`[Storyblok SDK] Error fetching story "${slug}":`, errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [sdk, slug]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  // Listen for Storyblok editor events and refresh if the current story is being edited
  useEffect(() => {
    if (!sdk || !isInEditor) return;

    const handleInput = (data: any) => {
      // Check if the updated story matches our current slug
      if (data?.story?.slug === slug || data?.story?.full_slug === slug) {
        setDraftContent(data.story);
      }
    };

    const handlePublished = async (data: any) => {
      // Refresh content when published
      if (!data || data?.story?.slug === slug || data?.story?.full_slug === slug) {
        await fetchContent();
      }
    };

    sdk.on('input', handleInput);
    sdk.on('published', handlePublished);

    return () => {
      sdk.off('input', handleInput);
      sdk.off('published', handlePublished);
    };
  }, [sdk, isInEditor, slug, fetchContent]);

  const currentContent = isInEditor ? draftContent : publishedContent;

  const renderContent = useCallback((content?: any) => {
    const contentToRender = content || currentContent?.content;
    return sdk?.renderStoryblokContent(contentToRender);
  }, [sdk, currentContent]);

  return {
    story: currentContent,
    draftContent,
    publishedContent,
    isLoading,
    error,
    isInEditor,
    renderContent,
    refreshContent: fetchContent,
  };
}

// Hook to get specific components from a story
export function useStoryblokComponent(slug: string, componentType: string) {
  const { story } = useStoryblokStory(slug);

  const component = story?.content?.body?.find((blok: any) => blok.component === componentType);

  return component || null;
}

// Hook to get all components of a specific type from a story
export function useStoryblokComponents(slug: string, componentType: string) {
  const { story } = useStoryblokStory(slug);

  const components = story?.content?.body?.filter((blok: any) => blok.component === componentType) || [];

  return components;
}

export { StoryblokConfig, StoryblokStory, StoryblokEvent, StoryblokEventType };