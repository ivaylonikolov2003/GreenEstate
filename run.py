from app import create_app, db
from app.models.user import User
from app.models.confirmation_token import ConfirmationToken
from app.models.property import Property
from app.models.plant import Plant, PlantRegion
from app.models.garden_plan import GardenPlan, PlanItem
from app.models.password_reset_token import PasswordResetToken

app = create_app()

with app.app_context():
    db.create_all()
    print('Таблиците са създадени успешно!')

if __name__ == '__main__':
    app.run(debug=True)