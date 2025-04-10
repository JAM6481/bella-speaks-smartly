
import { v4 as uuidv4 } from 'uuid';

// Define plugin interface
export interface BellaPlugin {
  id: string;
  name: string;
  description: string;
  version: string;
  isActive: boolean;
  capabilities: string[];
  apiEndpoints?: {
    [key: string]: string;
  };
  authType?: 'none' | 'apiKey' | 'oauth' | 'custom';
  authConfig?: any;
  icon?: string;
}

// Plugin Registry to manage available plugins
class PluginRegistry {
  private plugins: Map<string, BellaPlugin> = new Map();
  
  // Register a new plugin
  registerPlugin(plugin: Omit<BellaPlugin, 'id'>): BellaPlugin {
    const id = uuidv4();
    const newPlugin: BellaPlugin = {
      id,
      isActive: false,
      ...plugin
    };
    
    this.plugins.set(id, newPlugin);
    this.savePluginState();
    return newPlugin;
  }
  
  // Get all registered plugins
  getAllPlugins(): BellaPlugin[] {
    return Array.from(this.plugins.values());
  }
  
  // Get active plugins
  getActivePlugins(): BellaPlugin[] {
    return Array.from(this.plugins.values()).filter(plugin => plugin.isActive);
  }
  
  // Get plugin by ID
  getPluginById(id: string): BellaPlugin | undefined {
    return this.plugins.get(id);
  }
  
  // Activate a plugin
  activatePlugin(id: string): boolean {
    const plugin = this.plugins.get(id);
    if (plugin) {
      plugin.isActive = true;
      this.plugins.set(id, plugin);
      this.savePluginState();
      return true;
    }
    return false;
  }
  
  // Deactivate a plugin
  deactivatePlugin(id: string): boolean {
    const plugin = this.plugins.get(id);
    if (plugin) {
      plugin.isActive = false;
      this.plugins.set(id, plugin);
      this.savePluginState();
      return true;
    }
    return false;
  }
  
  // Remove a plugin
  removePlugin(id: string): boolean {
    const result = this.plugins.delete(id);
    if (result) {
      this.savePluginState();
    }
    return result;
  }
  
  // Update plugin configuration
  updatePluginConfig(id: string, config: Partial<BellaPlugin>): boolean {
    const plugin = this.plugins.get(id);
    if (plugin) {
      this.plugins.set(id, { ...plugin, ...config });
      this.savePluginState();
      return true;
    }
    return false;
  }
  
  // Save plugin state to localStorage
  private savePluginState(): void {
    try {
      localStorage.setItem(
        'bella_plugins',
        JSON.stringify(Array.from(this.plugins.values()))
      );
    } catch (error) {
      console.error('Error saving plugin state:', error);
    }
  }
  
  // Load plugin state from localStorage
  loadPluginState(): void {
    try {
      const savedPlugins = localStorage.getItem('bella_plugins');
      if (savedPlugins) {
        const plugins = JSON.parse(savedPlugins) as BellaPlugin[];
        this.plugins.clear();
        plugins.forEach(plugin => {
          this.plugins.set(plugin.id, plugin);
        });
      } else {
        // Initialize with default plugins if none exist
        this.initializeDefaultPlugins();
      }
    } catch (error) {
      console.error('Error loading plugin state:', error);
      // Initialize with defaults on error
      this.initializeDefaultPlugins();
    }
  }
  
  // Initialize default plugins
  private initializeDefaultPlugins(): void {
    // Weather plugin
    this.registerPlugin({
      name: 'Weather Insights',
      description: 'Get real-time weather data and forecasts',
      version: '1.0.0',
      capabilities: ['weather', 'forecast', 'alerts'],
      apiEndpoints: {
        current: 'https://api.weatherapi.com/v1/current.json',
        forecast: 'https://api.weatherapi.com/v1/forecast.json'
      },
      authType: 'apiKey',
      isActive: true,
      icon: 'cloud'
    });
    
    // Calendar plugin
    this.registerPlugin({
      name: 'Calendar Connect',
      description: 'Integrate with various calendar services',
      version: '1.0.0',
      capabilities: ['events', 'scheduling', 'reminders'],
      apiEndpoints: {
        events: 'https://www.googleapis.com/calendar/v3/events',
        calendars: 'https://www.googleapis.com/calendar/v3/calendars'
      },
      authType: 'oauth',
      isActive: false,
      icon: 'calendar'
    });
    
    // Note-taking plugin
    this.registerPlugin({
      name: 'Smart Notes',
      description: 'Create and manage intelligent notes',
      version: '1.0.0',
      capabilities: ['notes', 'reminders', 'tagging'],
      apiEndpoints: {
        notes: '/api/notes',
        tags: '/api/tags'
      },
      authType: 'none',
      isActive: true,
      icon: 'sticky-note'
    });
    
    // Email plugin
    this.registerPlugin({
      name: 'Email Assistant',
      description: 'Handle email-related tasks',
      version: '1.0.0',
      capabilities: ['send', 'read', 'draft', 'template'],
      apiEndpoints: {
        send: 'https://api.sendgrid.com/v3/mail/send',
        templates: 'https://api.sendgrid.com/v3/templates'
      },
      authType: 'apiKey',
      isActive: false,
      icon: 'mail'
    });
    
    this.savePluginState();
  }
}

// Create and export singleton instance
export const pluginRegistry = new PluginRegistry();

// Initialize plugin system
export const initializePluginSystem = (): void => {
  pluginRegistry.loadPluginState();
};

// Plugin Manager to handle plugin operations
export class PluginManager {
  // Call a plugin's capability
  static async invokePlugin(
    pluginId: string,
    capability: string,
    params: any = {}
  ): Promise<any> {
    const plugin = pluginRegistry.getPluginById(pluginId);
    
    if (!plugin || !plugin.isActive) {
      throw new Error(`Plugin not found or not active: ${pluginId}`);
    }
    
    if (!plugin.capabilities.includes(capability)) {
      throw new Error(`Capability not supported by plugin: ${capability}`);
    }
    
    // Here we'd implement the actual plugin invocation
    // This is a simplified example - real implementation would depend on the plugin system
    
    console.log(`Invoking plugin ${plugin.name} capability ${capability} with params:`, params);
    
    // For weather plugin demo
    if (pluginId === '1' && capability === 'weather' && plugin.name === 'Weather Insights') {
      // Mock weather data
      return {
        location: params.location || 'Unknown',
        temperature: Math.round(70 + Math.random() * 20),
        condition: ['Sunny', 'Partly Cloudy', 'Overcast', 'Light Rain'][Math.floor(Math.random() * 4)],
        humidity: Math.round(50 + Math.random() * 30),
        wind: Math.round(5 + Math.random() * 15)
      };
    }
    
    // Mock implementation for other plugins
    return {
      success: true,
      message: `${capability} processed successfully`,
      data: { ...params, timestamp: new Date().toISOString() }
    };
  }
  
  // Get plugins by capability
  static getPluginsForCapability(capability: string): BellaPlugin[] {
    return pluginRegistry
      .getActivePlugins()
      .filter(plugin => plugin.capabilities.includes(capability));
  }
}
