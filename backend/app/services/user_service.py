import uuid
from typing import Optional, Dict, Any
from sqlalchemy.orm import Session
from app.db.models import Manager, Employee
from app.core.security import hash_password, verify_password


class UserService:
    @staticmethod
    def get_manager_by_email(db: Session, email: str) -> Optional[Manager]:
        """Fetch manager by case-insensitive email from managers table ONLY."""
        return db.query(Manager).filter(Manager.email == email.strip().lower()).first()

    @staticmethod
    def get_manager_by_id(db: Session, manager_id: str) -> Optional[Manager]:
        """Fetch manager by ID from managers table ONLY."""
        return db.query(Manager).filter(Manager.id == manager_id).first()

    @staticmethod
    def get_employee_by_email(db: Session, email: str) -> Optional[Employee]:
        """Fetch employee by case-insensitive email from employees table ONLY."""
        return db.query(Employee).filter(Employee.email == email.strip().lower()).first()

    @staticmethod
    def get_employee_by_id(db: Session, employee_id: str) -> Optional[Employee]:
        """Fetch employee by ID from employees table ONLY."""
        return db.query(Employee).filter(Employee.id == employee_id).first()

    @staticmethod
    def email_exists(db: Session, email: str) -> bool:
        """Check if an email already exists in EITHER the managers OR employees table."""
        normalized_email = email.strip().lower()
        manager = UserService.get_manager_by_email(db, normalized_email)
        if manager:
            return True
        employee = UserService.get_employee_by_email(db, normalized_email)
        if employee:
            return True
        return False

    @staticmethod
    def create_manager(
        db: Session,
        name: str,
        email: str,
        plain_password: str,
        user_id: Optional[str] = None,
    ) -> Manager:
        """Create and insert a new record into the managers table ONLY."""
        normalized_email = email.strip().lower()
        if UserService.email_exists(db, normalized_email):
            raise ValueError(f"An account with email '{normalized_email}' already exists.")

        uid = user_id or f"mgr_{uuid.uuid4().hex[:12]}"
        password_hash = hash_password(plain_password)

        new_manager = Manager(
            id=uid,
            name=name.strip(),
            email=normalized_email,
            password_hash=password_hash,
        )
        db.add(new_manager)
        db.commit()
        db.refresh(new_manager)
        return new_manager

    @staticmethod
    def create_employee(
        db: Session,
        name: str,
        email: str,
        plain_password: str,
        phone_number: Optional[str] = None,
        user_id: Optional[str] = None,
    ) -> Employee:
        """Create and insert a new record into the employees table ONLY."""
        normalized_email = email.strip().lower()
        if UserService.email_exists(db, normalized_email):
            raise ValueError(f"An account with email '{normalized_email}' already exists.")

        uid = user_id or f"emp_{uuid.uuid4().hex[:12]}"
        password_hash = hash_password(plain_password)

        new_employee = Employee(
            id=uid,
            name=name.strip(),
            email=normalized_email,
            phone_number=phone_number.strip() if phone_number else None,
            password_hash=password_hash,
        )
        db.add(new_employee)
        db.commit()
        db.refresh(new_employee)
        return new_employee

    @staticmethod
    def authenticate_manager(db: Session, email: str, plain_password: str) -> Optional[Dict[str, Any]]:
        """Authenticate ONLY against the managers table. Never checks employees."""
        manager = UserService.get_manager_by_email(db, email)
        if not manager or not verify_password(plain_password, manager.password_hash):
            return None
        return manager.to_dict()

    @staticmethod
    def authenticate_employee(db: Session, email: str, plain_password: str) -> Optional[Dict[str, Any]]:
        """Authenticate ONLY against the employees table. Never checks managers."""
        employee = UserService.get_employee_by_email(db, email)
        if not employee or not verify_password(plain_password, employee.password_hash):
            return None
        return employee.to_dict()

    @staticmethod
    def get_by_id_and_role(db: Session, user_id: str, role: str) -> Optional[Dict[str, Any]]:
        """Fetch user by ID strictly from the designated role table ONLY."""
        if role == "manager":
            mgr = UserService.get_manager_by_id(db, user_id)
            return mgr.to_dict() if mgr else None
        elif role == "employee":
            emp = UserService.get_employee_by_id(db, user_id)
            return emp.to_dict() if emp else None
        return None

    @staticmethod
    def seed_demo_accounts(db: Session) -> None:
        """Seed default demo accounts into their respective tables if not present."""
        # 1. Demo Manager in managers table
        if not UserService.get_manager_by_email(db, "manager@echoflow.com"):
            try:
                UserService.create_manager(
                    db=db,
                    name="Demo Manager",
                    email="manager@echoflow.com",
                    plain_password="manager123",
                    user_id="demo-manager",
                )
            except Exception:
                db.rollback()

        # 2. Demo Employee in employees table
        if not UserService.get_employee_by_email(db, "employee@echoflow.com"):
            try:
                UserService.create_employee(
                    db=db,
                    name="Demo Employee",
                    email="employee@echoflow.com",
                    plain_password="employee123",
                    user_id="demo-employee",
                )
            except Exception:
                db.rollback()


user_service = UserService()
