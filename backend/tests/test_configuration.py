"""Assertion-based coverage for Configuration and the Configurable decorator
(ported from the former print-only root script test_configuration.py)."""

import pytest

from backend.models import Configuration, ConfigurableInterface, Configurable


def _sample():
    return Configuration(
        {
            "database": {
                "host": "localhost",
                "port": 5432,
                "credentials": {"username": "admin", "password": "secret"},
            },
            "api": {"timeout": 30, "endpoints": ["v1", "v2"]},
        }
    )


def test_nested_dot_access():
    config = _sample()
    assert config["database.host"] == "localhost"
    assert config["api.timeout"] == 30
    assert config["database.credentials.username"] == "admin"
    assert config["api.endpoints"] == ["v1", "v2"]


def test_set_creates_nested_path():
    config = _sample()
    config["new.section.value"] = "test"
    assert config["new.section.value"] == "test"


def test_contains_and_missing_key():
    config = _sample()
    assert "database.host" in config
    assert "database.credentials.password" in config
    assert "database.missing" not in config
    with pytest.raises(KeyError):
        _ = config["database.missing"]


def test_keys_with_prefix():
    config = _sample()
    db_keys = config.keys("database")
    assert "database.host" in db_keys
    assert "database.credentials.username" in db_keys
    assert all(k.startswith("database") for k in db_keys)
    assert "api.timeout" not in db_keys


def test_empty_and_mixed_types():
    empty = Configuration()
    assert len(empty) == 0

    mixed = Configuration()
    mixed["mixed.nested.value"] = "string_value"
    mixed["mixed.nested.number"] = 42
    mixed["mixed.nested.boolean"] = True
    assert mixed["mixed.nested.value"] == "string_value"
    assert mixed["mixed.nested.number"] == 42
    assert mixed["mixed.nested.boolean"] is True


def test_configurable_decorator_injects_configuration():
    @Configurable
    class Component(ConfigurableInterface):
        def defaultConfiguration(self):
            return {"database": {"host": "localhost", "port": 5432}}

        def get_host(self):
            return self.configuration["database.host"]

    component = Component()
    assert hasattr(component, "configuration")
    assert component.get_host() == "localhost"
    assert component.configuration["database.port"] == 5432
    assert isinstance(component.defaultConfiguration(), dict)


def test_configurable_rejects_non_interface_class():
    with pytest.raises(TypeError):

        @Configurable
        class NotConfigurable:  # does not implement ConfigurableInterface
            pass
