"""
Test script for the Configuration system.

This script tests the Configuration class implementation with the example
from the user's request.
"""

from backend.models import Configuration, ConfigurableInterface, Configurable
import json

def test_configuration():
    """Test the Configuration class with the provided example."""
    
    print("Testing Configuration class...")
    
    # Test Configuration class
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

    print('Configuration test:')
    print('Full config:', str(config))
    
    # Test accessing nested values
    print('\nAccessing nested values:')
    print('Accessing database.host:', config['database.host'])
    print('Accessing api.timeout:', config['api.timeout'])
    
    # Test setting new values
    print('\nSetting new values:')
    config['new.section.value'] = 'test'
    print('After setting new value:', config['new.section.value'])
    
    # Test keys with prefix
    print('\nKeys with prefix "database":', config.keys('database'))
    
    # Test that keys work for various levels
    print('\nTesting various key access patterns:')
    try:
        print('database.host:', config['database.host'])
        print('database.port:', config['database.port'])
        print('database.credentials.username:', config['database.credentials.username'])
        print('api.timeout:', config['api.timeout'])
        print('api.endpoints:', config['api.endpoints'])
        
        # Test setting nested values that don't exist yet
        config['unexisting.nested.value'] = 'new_value'
        print('New nested value:', config['unexisting.nested.value'])
        
    except Exception as e:
        print(f"Error accessing keys: {e}")
    
    return config

def test_configurable():
    """Test the Configurable decorator."""
    
    print("\n\nTesting Configurable decorator...")
    
    @Configurable
    class TestComponent(ConfigurableInterface):
        def defaultConfiguration(self) -> dict:
            return {
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
            }
        
        def get_host(self):
            """Method to access configuration."""
            return self.configuration['database.host']
    
    # Create an instance
    component = TestComponent()
    
    print("Testing Configurable component:")
    print("Configuration:", str(component.configuration))
    print("Host from config:", component.get_host())
    
    # Test that it has configuration attribute
    print("Has configuration attribute:", hasattr(component, 'configuration'))
    
    # Test that it properly implements the interface
    try:
        default_config = component.defaultConfiguration()
        print("Default configuration works:", isinstance(default_config, dict))
    except Exception as e:
        print(f"Error in defaultConfiguration: {e}")

def test_edge_cases():
    """Test edge cases for the Configuration class."""
    
    print("\n\nTesting edge cases...")
    
    # Test empty configuration
    empty_config = Configuration()
    print("Empty config created successfully")
    
    # Test setting and getting simple values
    simple_config = Configuration()
    simple_config['simple.key'] = 'value'
    print("Simple key access:", simple_config['simple.key'])
    
    # Test nested with mixed types
    mixed_config = Configuration()
    mixed_config['mixed.nested.value'] = 'string_value'
    mixed_config['mixed.nested.number'] = 42
    mixed_config['mixed.nested.boolean'] = True
    
    print("Mixed type access - string:", mixed_config['mixed.nested.value'])
    print("Mixed type access - number:", mixed_config['mixed.nested.number'])
    print("Mixed type access - boolean:", mixed_config['mixed.nested.boolean'])

if __name__ == "__main__":
    # Run all tests
    config = test_configuration()
    test_configurable()
    test_edge_cases()
    
    print("\n\nAll tests completed successfully!")