"""
Configuration management system for Ranked Choice Voting system.

This module provides a Configuration class that supports nested dictionary
structures accessible via dot-delimited keys and a Configurable decorator.
"""

from typing import Dict, Any, Union
import json


class Configuration(dict):
    """
    A dict subclass that supports arbitrarily deep nested dictionary structures
    accessible via dot-delimited strings.
    
    Example usage:
        config = Configuration({
            'database': {
                'host': 'localhost',
                'port': 5432,
                'credentials': {
                    'username': 'admin',
                    'password': 'secret'
                }
            },
            'api': {
                'timeout': 30,
                'endpoints': ['v1', 'v2']
            }
        })
        
        # Access nested values
        print(config['database.host'])  # 'localhost'
        print(config['api.timeout'])   # 30
        
        # Set nested values
        config['new.section.value'] = 'test'
        print(config['new.section.value'])  # 'test'
    """
    
    def __init__(self, *args, **kwargs):
        """Initialize the Configuration with nested dictionary structure."""
        super().__init__()
        if args:
            # Handle initialization with a dictionary or another Configuration instance
            if len(args) == 1:
                data = args[0]
                if isinstance(data, dict):
                    self._update_from_dict(data)
                elif hasattr(data, '__dict__'):
                    # Handle case where we're initializing from an object
                    self._update_from_dict(data.__dict__)
                else:
                    # Handle any other iterable that represents a dictionary
                    self._update_from_dict(dict(data))
            else:
                # Handle multiple arguments as key-value pairs
                self._update_from_dict(dict(zip(args[::2], args[1::2])))
        else:
            # Handle keyword arguments
            self._update_from_dict(kwargs)
    
    def _update_from_dict(self, data: Dict[str, Any]):
        """Update configuration from dictionary with nested structure."""
        for key, value in data.items():
            if isinstance(value, dict):
                # Recursively process nested dictionaries
                if key in self and isinstance(self[key], dict):
                    # Merge with existing dictionary
                    self._merge_nested_dicts(self[key], value)
                else:
                    # Create new nested structure
                    self[key] = value
            else:
                # Simple key-value assignment
                self[key] = value
    
    def _merge_nested_dicts(self, target: Dict[str, Any], source: Dict[str, Any]):
        """Merge nested dictionaries recursively."""
        for key, value in source.items():
            if isinstance(value, dict) and key in target and isinstance(target[key], dict):
                # Recursively merge nested dictionaries
                self._merge_nested_dicts(target[key], value)
            else:
                target[key] = value
    
    def _get_nested_value(self, keys: list) -> Any:
        """
        Get value from nested structure by key path.
        
        Args:
            keys: List of keys representing the nested path
            
        Returns:
            The value at the specified path, or None if not found
        """
        current = self
        try:
            for key in keys[:-1]:
                if isinstance(current, dict) and dict.__contains__(current, key):
                    current = dict.__getitem__(current, key)
                else:
                    return None
            # Get the final value
            if isinstance(current, dict) and dict.__contains__(current, keys[-1]):
                return dict.__getitem__(current, keys[-1])
            else:
                return None
        except (KeyError, TypeError):
            return None
    
    def _set_nested_value(self, keys: list, value: Any):
        """
        Set value in nested structure by key path.
        
        Args:
            keys: List of keys representing the nested path
            value: The value to set at the specified path
        """
        current = self
        
        # Navigate to the parent level of the target key
        for key in keys[:-1]:
            if isinstance(current, dict):
                if not dict.__contains__(current, key):
                    dict.__setitem__(current, key, {})
                current = dict.__getitem__(current, key)
            else:
                # If we can't navigate deeper, create new structure
                current = {}

        # Set the actual value at the last key
        if isinstance(current, dict):
            dict.__setitem__(current, keys[-1], value)
    
    def _split_key(self, key: str) -> list:
        """
        Split a dot-delimited key into its component parts.
        
        Args:
            key: The dot-delimited key string
            
        Returns:
            List of key components
        """
        return key.split('.')
    
    def __getitem__(self, key: str) -> Any:
        """
        Get item using dot-delimited path.
        
        Args:
            key: Dot-delimited string representing nested path
            
        Returns:
            The value at the specified path
            
        Raises:
            KeyError: If the key path does not exist
        """
        keys = self._split_key(key)
        result = self._get_nested_value(keys)
        
        if result is None:
            # Try to find the key in the flat structure as a fallback
            if dict.__contains__(self, key):
                return dict.__getitem__(self, key)

            raise KeyError(f"Key '{key}' not found")
        
        return result
    
    def __setitem__(self, key: str, value: Any):
        """
        Set item using dot-delimited path.
        
        Args:
            key: Dot-delimited string representing nested path
            value: The value to set at the specified path
        """
        keys = self._split_key(key)
        
        # Create any missing intermediate structures
        current = self
        for k in keys[:-1]:
            if isinstance(current, dict):
                if not dict.__contains__(current, k):
                    dict.__setitem__(current, k, {})
                current = dict.__getitem__(current, k)
            else:
                # If we can't navigate deeper, replace with dict
                current = {}

        # Set the actual value
        if isinstance(current, dict):
            dict.__setitem__(current, keys[-1], value)
    
    def __contains__(self, key: str) -> bool:
        """
        Check if a dot-delimited key path exists.
        
        Args:
            key: Dot-delimited string representing nested path
            
        Returns:
            True if the key path exists, False otherwise
        """
        try:
            self[key]
            return True
        except KeyError:
            return False
    
    def keys(self, prefix: str = "") -> list:
        """
        Get all keys with a specific prefix.
        
        Args:
            prefix: The prefix to filter keys by
            
        Returns:
            List of keys that start with the given prefix
        """
        result = []
        
        def _collect_keys(d: Dict[str, Any], current_path: str = ""):
            for key, value in d.items():
                new_path = f"{current_path}.{key}" if current_path else key
                
                # If prefix is provided, only include keys that match
                if not prefix or new_path.startswith(prefix):
                    result.append(new_path)
                
                # Recursively process nested dictionaries
                if isinstance(value, dict):
                    _collect_keys(value, new_path)
        
        _collect_keys(self)
        return result
    
    def __str__(self) -> str:
        """Return string representation of the configuration."""
        return json.dumps(self, indent=2, default=str)
    
    def __repr__(self) -> str:
        """Return detailed string representation."""
        return f"Configuration({super().__repr__()})"


class ConfigurableInterface:
    """
    Interface that enforced decorated classes to implement defaultConfiguration() method.
    
    Classes that use the Configurable decorator must implement this method
    to provide default configuration values.
    """
    
    def defaultConfiguration(self) -> Dict[str, Any]:
        """
        Return the default configuration for this configurable component.
        
        Returns:
            Dict: Default configuration as nested dictionary
        """
        raise NotImplementedError("Classes using Configurable decorator must implement defaultConfiguration method")


class Configurable:
    """
    Decorator class that provides decorated classes with a configuration attribute.
    
    Usage:
        @Configurable
        class MyComponent(ConfigurableInterface):
            def defaultConfiguration(self) -> Dict[str, Any]:
                return {
                    'database': {
                        'host': 'localhost',
                        'port': 5432
                    }
                }
            
            def some_method(self):
                # Access configuration
                host = self.configuration['database.host']
                return f"Connected to {host}"
    """
    
    def __init__(self, cls):
        """
        Initialize the Configurable decorator.
        
        Args:
            cls: The class to be decorated
        """
        self.cls = cls
        
        # Validate that the decorated class implements ConfigurableInterface
        if not isinstance(cls(), ConfigurableInterface):
            raise TypeError("Decorated class must implement ConfigurableInterface")
        
        # Store the original __init__ method for later use
        self.original_init = getattr(cls, '__init__', lambda *args, **kwargs: None)
        
        # Wrap the class with configuration capabilities
        self._wrap_class()
    
    def _wrap_class(self):
        """Wrap the decorated class to add configuration functionality."""

        # Capture the original init in the closure — it lives on the decorator,
        # not on the instances of the wrapped class.
        original_init = self.original_init

        # Create a new class that inherits from the original
        class ConfigurableClass(self.cls):
            def __init__(instance, *args, **kwargs):
                # Call the original __init__
                original_init(instance, *args, **kwargs)

                # Initialize configuration
                instance.configuration = Configuration(instance.defaultConfiguration())
        
        # Replace the original class with the wrapped one
        self.cls = ConfigurableClass
        
        # Update the class name to reflect that it's decorated
        self.cls.__name__ = f"Configurable{self.cls.__name__}"
        self.cls.__qualname__ = f"Configurable{self.cls.__qualname__}"
    
    def __call__(self, *args, **kwargs):
        """Make the decorator callable."""
        return self.cls(*args, **kwargs)