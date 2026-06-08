from flask import Blueprint, request, jsonify
from app import db
from app.models.plant import Plant, PlantRegion
from app.models.property import Property
from app.models.enums import WaterNeedsEnum, SunExposureEnum, SoilTypeEnum, SeasonEnum, CareDifficultyEnum
from flask_jwt_extended import jwt_required, get_jwt_identity

plants_bp = Blueprint('plants', __name__)


@plants_bp.route('/plants', methods=['GET'])
def get_plants():
    plants = Plant.query.all()

    result = []
    for plant in plants:
        result.append({
            'id': plant.id,
            'name': plant.name,
            'description': plant.description,
            'water_needs': plant.water_needs.value,
            'sun_needs': plant.sun_needs.value,
            'season': plant.season.value,
            'soil_type': plant.soil_type.value if plant.soil_type else None,
            'min_temp_celsius': plant.min_temp_celsius,
            'max_height_cm': plant.max_height_cm,
            'care_difficulty': plant.care_difficulty.value,
            'image_url': plant.image_url,
            'price': float(plant.price) if plant.price is not None else 0,
            'quantity_per_sqm': float(plant.quantity_per_sqm) if plant.quantity_per_sqm is not None else 0,
            'regions': [r.region for r in plant.regions]
        })

    return jsonify(result), 200


@plants_bp.route('/plants/recommend', methods=['GET'])
@jwt_required()
def recommend_plants():
    user_id = get_jwt_identity()
    property_id = request.args.get('property_id')
    budget = request.args.get('budget')

    if not property_id:
        return jsonify({'message': 'property_id е задължителен!'}), 400

    if not property_id.isdigit():
        return jsonify({'message': 'property_id трябва да е число!'}), 400

    if int(property_id) <= 0:
        return jsonify({'message': 'property_id трябва да е положително число!'}), 400

    prop = Property.query.filter_by(id=property_id, user_id=user_id).first()

    if not prop:
        return jsonify({'message': 'Имотът не е намерен!'}), 404

    effective_area = float(prop.green_area_sqm) if prop.green_area_sqm else float(prop.area_sqm)

    query = Plant.query

    query = query.filter(Plant.sun_needs == prop.sun_exposure)

    if prop.soil_type:
        query = query.filter(
            (Plant.soil_type == prop.soil_type) |
            (Plant.soil_type == None)
        )
    query = query.filter(
        Plant.regions.any(PlantRegion.region == prop.region)
    )

    plants = query.all()

    if budget:
        try:
            budget = float(budget)
            if budget <= 0:
                return jsonify({'message': 'Бюджетът трябва да е положително число!'}), 400

            filtered_plants = []
            for plant in plants:
                qsm = float(plant.quantity_per_sqm)
                if qsm > 0:
                    recommended_quantity = effective_area * qsm
                else:
                    height = plant.max_height_cm or 0
                    area = effective_area
                    if area <= 150:
                        if height > 2500:   recommended_quantity = 1
                        elif height > 1000: recommended_quantity = 2
                        else:               recommended_quantity = 3
                    elif area <= 400:
                        if height > 2500:   recommended_quantity = 2
                        elif height > 1000: recommended_quantity = 3
                        else:               recommended_quantity = 5
                    else:
                        if height > 2500:   recommended_quantity = 3
                        elif height > 1000: recommended_quantity = 5
                        else:               recommended_quantity = 8
                total_cost = float(plant.price) * recommended_quantity
                if total_cost <= budget:
                    filtered_plants.append(plant)
            plants = filtered_plants

        except ValueError:
            return jsonify({'message': 'Бюджетът трябва да е число!'}), 400

    if not plants:
        return jsonify({'message': 'Няма намерени растения за този имот!'}), 404

    GRASS_KEYWORDS = ['трева', 'тревна', 'чим', 'lawn', 'grass']

    def is_grass(name):
        return any(k in name.lower() for k in GRASS_KEYWORDS)

    def calc_quantity(plant, area_sqm):
        qsm = float(plant.quantity_per_sqm)
        if qsm > 0:
            return round(area_sqm * qsm, 1)
        else:
            # Дървета — засаждане според размера на имота и вида на дървото
            height = plant.max_height_cm or 0
            if area_sqm <= 150:
                # Малък имот
                if height > 2500:   return 1
                elif height > 1000: return 2
                else:               return 3
            elif area_sqm <= 400:
                # Среден имот
                if height > 2500:   return 2
                elif height > 1000: return 3
                else:               return 5
            else:
                # Голям имот
                if height > 2500:   return 3
                elif height > 1000: return 5
                else:               return 8

    result = []
    for plant in plants:
        area = effective_area
        qty = calc_quantity(plant, area)
        estimated = round(float(plant.price) * qty, 2)
        result.append({
            'id': plant.id,
            'name': plant.name,
            'description': plant.description,
            'water_needs': plant.water_needs.value,
            'sun_needs': plant.sun_needs.value,
            'season': plant.season.value,
            'soil_type': plant.soil_type.value if plant.soil_type else None,
            'min_temp_celsius': plant.min_temp_celsius,
            'max_height_cm': plant.max_height_cm,
            'care_difficulty': plant.care_difficulty.value,
            'image_url': plant.image_url,
            'regions': [r.region for r in plant.regions],
            'price': float(plant.price),
            'quantity_per_sqm': float(plant.quantity_per_sqm),
            'recommended_quantity': qty,
            'estimated_cost': estimated
        })

    return jsonify(result), 200

@plants_bp.route('/plants/<int:id>', methods=['GET'])
def get_plant(id):
    plant = db.session.get(Plant, id)

    if not plant:
        return jsonify({'message': 'Растението не е намерено!'}), 404

    return jsonify({
        'id': plant.id,
        'name': plant.name,
        'description': plant.description,
        'water_needs': plant.water_needs.value,
        'sun_needs': plant.sun_needs.value,
        'season': plant.season.value,
        'soil_type': plant.soil_type.value if plant.soil_type else None,
        'min_temp_celsius': plant.min_temp_celsius,
        'max_height_cm': plant.max_height_cm,
        'care_difficulty': plant.care_difficulty.value,
        'image_url': plant.image_url,
        'price': float(plant.price) if plant.price is not None else 0,
        'quantity_per_sqm': float(plant.quantity_per_sqm) if plant.quantity_per_sqm is not None else 0,
        'regions': [r.region for r in plant.regions]
    }), 200


@plants_bp.route('/plants', methods=['POST'])
@jwt_required()
def create_plant():
    user_id = get_jwt_identity()

    from app.models.user import User
    from app.models.enums import RoleEnum
    user = db.session.get(User, user_id)
    if user.role != RoleEnum.ADMIN:
        return jsonify({'message': 'Нямате права за това действие!'}), 403

    data = request.get_json()

    # Валидация на задължителните полета
    required_fields = ['name', 'water_needs', 'sun_needs', 'season', 'care_difficulty']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'message': f'Полето {field} е задължително!'}), 400

    # Валидация на enums
    try:
        water_needs = WaterNeedsEnum[data['water_needs']]
        sun_needs = SunExposureEnum[data['sun_needs']]
        season = SeasonEnum[data['season']]
        care_difficulty = CareDifficultyEnum[data['care_difficulty']]
        soil_type = SoilTypeEnum[data['soil_type']] if data.get('soil_type') else None
    except KeyError:
        return jsonify({'message': 'Невалидна стойност за някое от полетата!'}), 400

    plant = Plant(
        name=data['name'],
        description=data.get('description'),
        water_needs=water_needs,
        sun_needs=sun_needs,
        season=season,
        soil_type=soil_type,
        min_temp_celsius=data.get('min_temp_celsius'),
        max_height_cm=data.get('max_height_cm'),
        care_difficulty=care_difficulty,
        image_url=data.get('image_url'),
        price=float(data['price']) if data.get('price') is not None else 0,
        quantity_per_sqm=float(data['quantity_per_sqm']) if data.get('quantity_per_sqm') is not None else 0
    )

    db.session.add(plant)
    db.session.flush()

    # Добавяне на региони
    if data.get('regions'):
        for region in data['regions']:
            plant_region = PlantRegion(
                plant_id=plant.id,
                region=region
            )
            db.session.add(plant_region)

    db.session.commit()

    return jsonify({'message': 'Растението е добавено успешно!', 'id': plant.id}), 201


@plants_bp.route('/plants/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_plant(id):
    from app.models.user import User
    from app.models.enums import RoleEnum
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)

    if user.role != RoleEnum.ADMIN:
        return jsonify({'message': 'Нямате права за това действие!'}), 403

    plant = db.session.get(Plant, id)

    if not plant:
        return jsonify({'message': 'Растението не е намерено!'}), 404

    # Изтриваме регионите преди растението
    PlantRegion.query.filter_by(plant_id=plant.id).delete()
    db.session.delete(plant)
    db.session.commit()

    return jsonify({'message': 'Растението е изтрито успешно!'}), 200

@plants_bp.route('/plants/<int:id>', methods=['PUT'])
@jwt_required()
def update_plant(id):
    from app.models.user import User
    from app.models.enums import RoleEnum
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)

    if user.role != RoleEnum.ADMIN:
        return jsonify({'message': 'Нямате права за това действие!'}), 403

    plant = db.session.get(Plant, id)
    if not plant:
        return jsonify({'message': 'Растението не е намерено!'}), 404

    data = request.get_json()

    try:
        if data.get('water_needs'):
            plant.water_needs = WaterNeedsEnum[data['water_needs']]
        if data.get('sun_needs'):
            plant.sun_needs = SunExposureEnum[data['sun_needs']]
        if data.get('season'):
            plant.season = SeasonEnum[data['season']]
        if data.get('care_difficulty'):
            plant.care_difficulty = CareDifficultyEnum[data['care_difficulty']]
        if 'soil_type' in data:
            plant.soil_type = SoilTypeEnum[data['soil_type']] if data['soil_type'] else None
    except KeyError:
        return jsonify({'message': 'Невалидна стойност за някое от полетата!'}), 400

    plant.name             = data.get('name', plant.name)
    plant.description      = data.get('description', plant.description)
    plant.min_temp_celsius = data.get('min_temp_celsius', plant.min_temp_celsius)
    plant.max_height_cm    = data.get('max_height_cm', plant.max_height_cm)
    plant.image_url        = data.get('image_url', plant.image_url)
    plant.price            = float(data['price']) if data.get('price') is not None else plant.price
    plant.quantity_per_sqm = float(data['quantity_per_sqm']) if data.get('quantity_per_sqm') is not None else plant.quantity_per_sqm

    # Обновяване на региони
    if 'regions' in data:
        PlantRegion.query.filter_by(plant_id=plant.id).delete()
        for region in data['regions']:
            db.session.add(PlantRegion(plant_id=plant.id, region=region))

    db.session.commit()
    return jsonify({'message': 'Растението е обновено успешно!'}), 200