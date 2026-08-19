"""
User Store Service (PostgreSQL Database Repository)

===============================================================================
Connected to local PostgreSQL database 'echo_flow'.
Managers are stored strictly in the 'managers' table.
Employees are stored strictly in the 'employees' table.
===============================================================================
"""

from typing import Optional, Dict, Any
from app.db.session import SessionLocal
from app.services.user_service import user_service


class UserStore:
    """PostgreSQL-backed User Store Facade with strict role isolation."""

    def get_by_id_and_role(self, user_id: str, role: str) -> Optional[Dict[str, Any]]:
        with SessionLocal() as db:
            return user_service.get_by_id_and_role(db, user_id, role)

    def email_exists(self, email: str) -> bool:
        with SessionLocal() as db:
            return user_service.email_exists(db, email)

    def create_manager(self, name: str, email: str, plain_password: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        with SessionLocal() as db:
            manager = user_service.create_manager(db, name, email, plain_password, user_id)
            return manager.to_dict()

    def create_employee(self, name: str, email: str, plain_password: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        with SessionLocal() as db:
            employee = user_service.create_employee(db, name, email, plain_password, user_id)
            return employee.to_dict()

    def create_user(
        self,
        name: str,
        email: str,
        plain_password: str,
        role: str,
        user_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        if role == "manager":
            return self.create_manager(name, email, plain_password, user_id)
        elif role == "employee":
            return self.create_employee(name, email, plain_password, user_id)
        else:
            raise ValueError(f"Invalid role '{role}'. Allowed roles are 'manager' or 'employee'.")

    def authenticate_manager(self, email: str, plain_password: str) -> Optional[Dict[str, Any]]:
        with SessionLocal() as db:
            return user_service.authenticate_manager(db, email, plain_password)

    def authenticate_employee(self, email: str, plain_password: str) -> Optional[Dict[str, Any]]:
        with SessionLocal() as db:
            return user_service.authenticate_employee(db, email, plain_password)


user_store = UserStore()
