from app import db
import enum
from app.models.enums import WaterNeedsEnum, SunExposureEnum, SoilTypeEnum, SeasonEnum, CareDifficultyEnum

class Plant(db.Model):
    __tablename__ = 'plants'

    id = db.Column(db.BigInteger, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    water_needs = db.Column(db.Enum(WaterNeedsEnum), nullable=False)
    sun_needs = db.Column(db.Enum(SunExposureEnum), nullable=False)
    season = db.Column(db.Enum(SeasonEnum), nullable=False)
    soil_type = db.Column(db.Enum(SoilTypeEnum))
    min_temp_celsius = db.Column(db.Integer)
    max_height_cm = db.Column(db.Integer)
    care_difficulty = db.Column(db.Enum(CareDifficultyEnum), nullable=False)
    image_url = db.Column(db.String(255))
    price = db.Column(db.Numeric(10, 2), default=0)
    quantity_per_sqm = db.Column(db.Numeric(10, 2), default=0.5)

    # Връзки с други таблици
    regions = db.relationship('PlantRegion', backref='plant', lazy=True)
    plan_items = db.relationship('PlanItem', backref='plant', lazy=True)

    def __repr__(self):
        return f'<Plant {self.name}>'


class PlantRegion(db.Model):
    __tablename__ = 'plant_regions'

    plant_id = db.Column(db.BigInteger, db.ForeignKey('plants.id'), primary_key=True)
    region = db.Column(db.String(100), primary_key=True)

    def __repr__(self):
        return f'<PlantRegion {self.region}>'