"""
Seed script — изпълни веднъж за да добавиш примерни растения с цени и снимки.
Пусни от корена на проекта: python seed_plants.py
"""

from app import create_app, db
from app.models.plant import Plant, PlantRegion
from app.models.enums import WaterNeedsEnum, SunExposureEnum, SoilTypeEnum, SeasonEnum, CareDifficultyEnum

app = create_app()

PLANTS = [
    {
        "name": "Роза",
        "description": "Класическа градинска роза с богат аромат и разнообразни цветове. Незаменима за всяка градина.",
        "water_needs": WaterNeedsEnum.MEDIUM,
        "sun_needs": SunExposureEnum.FULL_SUN,
        "season": SeasonEnum.SUMMER,
        "soil_type": SoilTypeEnum.LOAMY,
        "min_temp_celsius": -15,
        "max_height_cm": 150,
        "care_difficulty": CareDifficultyEnum.MEDIUM,
        "image_url": "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=400&q=80",
        "price": 8.50,
        "quantity_per_sqm": 3.0,
        "regions": ["София", "Пловдив", "Варна", "Бургас", "Велико Търново"],
    },
    {
        "name": "Лавандула",
        "description": "Ароматно многогодишно растение с лилави класове. Устойчиво на суша, привлича пчели и пеперуди.",
        "water_needs": WaterNeedsEnum.LOW,
        "sun_needs": SunExposureEnum.FULL_SUN,
        "season": SeasonEnum.SUMMER,
        "soil_type": SoilTypeEnum.SANDY,
        "min_temp_celsius": -20,
        "max_height_cm": 80,
        "care_difficulty": CareDifficultyEnum.EASY,
        "image_url": "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=80",
        "price": 5.00,
        "quantity_per_sqm": 4.0,
        "regions": ["София", "Пловдив", "Стара Загора", "Хасково", "Велико Търново"],
    },
    {
        "name": "Хортензия",
        "description": "Едри цветни чадъри в синьо, розово или бяло. Обича влажни места и частична сянка.",
        "water_needs": WaterNeedsEnum.HIGH,
        "sun_needs": SunExposureEnum.PARTIAL_SUN,
        "season": SeasonEnum.SUMMER,
        "soil_type": SoilTypeEnum.LOAMY,
        "min_temp_celsius": -10,
        "max_height_cm": 200,
        "care_difficulty": CareDifficultyEnum.MEDIUM,
        "image_url": "https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?w=400&q=80",
        "price": 15.00,
        "quantity_per_sqm": 1.0,
        "regions": ["Варна", "Бургас", "Пловдив", "София"],
    },
    {
        "name": "Туя",
        "description": "Вечнозелен храст с пирамидална форма. Идеален за жив плет, устойчив на студ и замърсяване.",
        "water_needs": WaterNeedsEnum.MEDIUM,
        "sun_needs": SunExposureEnum.FULL_SUN,
        "season": SeasonEnum.ALL_YEAR,
        "soil_type": None,
        "min_temp_celsius": -30,
        "max_height_cm": 600,
        "care_difficulty": CareDifficultyEnum.EASY,
        "image_url": "https://images.unsplash.com/photo-1610296669228-602fa827fc1f?w=400&q=80",
        "price": 22.00,
        "quantity_per_sqm": 1.5,
        "regions": ["София", "Пловдив", "Варна", "Бургас", "Велико Търново", "Стара Загора", "Русе"],
    },
    {
        "name": "Чемшир",
        "description": "Класически вечнозелен храст за формиране на бордюри и топиари. Бавнорастящ и издръжлив.",
        "water_needs": WaterNeedsEnum.MEDIUM,
        "sun_needs": SunExposureEnum.PARTIAL_SUN,
        "season": SeasonEnum.ALL_YEAR,
        "soil_type": SoilTypeEnum.LOAMY,
        "min_temp_celsius": -15,
        "max_height_cm": 150,
        "care_difficulty": CareDifficultyEnum.EASY,
        "image_url": "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80",
        "price": 12.00,
        "quantity_per_sqm": 4.0,
        "regions": ["София", "Пловдив", "Варна", "Велико Търново", "Русе"],
    },
    {
        "name": "Тревна смеска (луксозна)",
        "description": "Плътна, тъмнозелена тревна смеска за декоративни морави. Бърз растеж и отлична устойчивост на тъпкане.",
        "water_needs": WaterNeedsEnum.MEDIUM,
        "sun_needs": SunExposureEnum.FULL_SUN,
        "season": SeasonEnum.ALL_YEAR,
        "soil_type": SoilTypeEnum.LOAMY,
        "min_temp_celsius": -25,
        "max_height_cm": 15,
        "care_difficulty": CareDifficultyEnum.EASY,
        "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80",
        "price": 3.50,
        "quantity_per_sqm": 30.0,
        "regions": ["София", "Пловдив", "Варна", "Бургас", "Велико Търново", "Стара Загора", "Русе", "Хасково"],
    },
    {
        "name": "Рododendron",
        "description": "Великолепно цъфтящ храст с едри цветове в пурпурно, розово или бяло. Обича кисела почва.",
        "water_needs": WaterNeedsEnum.HIGH,
        "sun_needs": SunExposureEnum.PARTIAL_SUN,
        "season": SeasonEnum.SPRING,
        "soil_type": SoilTypeEnum.SANDY,
        "min_temp_celsius": -20,
        "max_height_cm": 300,
        "care_difficulty": CareDifficultyEnum.HARD,
        "image_url": "https://images.unsplash.com/photo-1490750967868-88df5691cc8f?w=400&q=80",
        "price": 18.00,
        "quantity_per_sqm": 0.5,
        "regions": ["Варна", "Бургас", "Пловдив", "Велико Търново"],
    },
    {
        "name": "Бор (декоративен)",
        "description": "Декоративен иглолистен бор с красива корона. Подходящ за по-просторни градини и паркове.",
        "water_needs": WaterNeedsEnum.LOW,
        "sun_needs": SunExposureEnum.FULL_SUN,
        "season": SeasonEnum.ALL_YEAR,
        "soil_type": SoilTypeEnum.SANDY,
        "min_temp_celsius": -30,
        "max_height_cm": 1500,
        "care_difficulty": CareDifficultyEnum.EASY,
        "image_url": "https://images.unsplash.com/photo-1446329813274-7c9036bd9a1f?w=400&q=80",
        "price": 45.00,
        "quantity_per_sqm": 0.1,
        "regions": ["София", "Велико Търново", "Стара Загора", "Русе"],
    },
    {
        "name": "Магнолия",
        "description": "Величествено дърво с едри бели или розови цветове рано напролет. Символ на изтънченост.",
        "water_needs": WaterNeedsEnum.MEDIUM,
        "sun_needs": SunExposureEnum.FULL_SUN,
        "season": SeasonEnum.SPRING,
        "soil_type": SoilTypeEnum.LOAMY,
        "min_temp_celsius": -15,
        "max_height_cm": 800,
        "care_difficulty": CareDifficultyEnum.MEDIUM,
        "image_url": "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=400&q=80",
        "price": 55.00,
        "quantity_per_sqm": 0.08,
        "regions": ["Пловдив", "Варна", "Бургас", "София"],
    },
    {
        "name": "Жасмин",
        "description": "Увивно растение с бели звездовидни цветчета и интензивен аромат. Перфектно за беседки и огради.",
        "water_needs": WaterNeedsEnum.MEDIUM,
        "sun_needs": SunExposureEnum.FULL_SUN,
        "season": SeasonEnum.SUMMER,
        "soil_type": SoilTypeEnum.LOAMY,
        "min_temp_celsius": -10,
        "max_height_cm": 400,
        "care_difficulty": CareDifficultyEnum.EASY,
        "image_url": "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&q=80",
        "price": 9.00,
        "quantity_per_sqm": 1.0,
        "regions": ["Пловдив", "Варна", "Бургас", "Хасково", "Стара Загора"],
    },
    {
        "name": "Сенчеста папрат",
        "description": "Елегантна папрат за тенисти места и северни изложения. Не изисква пряка слънчева светлина.",
        "water_needs": WaterNeedsEnum.HIGH,
        "sun_needs": SunExposureEnum.SHADE,
        "season": SeasonEnum.ALL_YEAR,
        "soil_type": SoilTypeEnum.LOAMY,
        "min_temp_celsius": -20,
        "max_height_cm": 70,
        "care_difficulty": CareDifficultyEnum.EASY,
        "image_url": "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=400&q=80",
        "price": 6.00,
        "quantity_per_sqm": 5.0,
        "regions": ["София", "Велико Търново", "Русе", "Варна"],
    },
    {
        "name": "Слънчоглед (декоративен)",
        "description": "Висок и слънчев едногодишник с жълти цветове. Лесен за отглеждане, впечатляващ визуален ефект.",
        "water_needs": WaterNeedsEnum.MEDIUM,
        "sun_needs": SunExposureEnum.FULL_SUN,
        "season": SeasonEnum.SUMMER,
        "soil_type": None,
        "min_temp_celsius": 0,
        "max_height_cm": 250,
        "care_difficulty": CareDifficultyEnum.EASY,
        "image_url": "https://images.unsplash.com/photo-1470509037663-253afd7f0f51?w=400&q=80",
        "price": 2.50,
        "quantity_per_sqm": 2.0,
        "regions": ["София", "Пловдив", "Варна", "Бургас", "Стара Загора", "Русе", "Хасково"],
    },
]

with app.app_context():
    added = 0
    skipped = 0
    for data in PLANTS:
        regions = data.pop("regions")
        existing = Plant.query.filter_by(name=data["name"]).first()
        if existing:
            skipped += 1
            data["regions"] = regions  # restore for next iteration
            continue

        plant = Plant(**data)
        db.session.add(plant)
        db.session.flush()

        for region in regions:
            db.session.add(PlantRegion(plant_id=plant.id, region=region))

        added += 1
        data["regions"] = regions  # restore

    db.session.commit()
    print(f"✅ Добавени: {added} растения | Пропуснати (вече съществуват): {skipped}")