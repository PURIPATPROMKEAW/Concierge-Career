from backend.app.core import Session, engine
from backend.app.models import Base
from backend.app.repositories import seed

if __name__ == "__main__":
    Base.metadata.create_all(engine)
    with Session() as db:
        seed(db)
    print("Demo seed ready. Existing profiles were preserved.")
