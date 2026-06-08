from flask import Blueprint, request, jsonify
from app import db
from app.models.property import Property
from app.models.garden_plan import GardenPlan, PlanItem
from app.models.enums import PropertyTypeEnum, SunExposureEnum, SoilTypeEnum
from flask_jwt_extended import jwt_required, get_jwt_identity

properties_bp = Blueprint('properties', __name__)


@properties_bp.route('/properties', methods=['GET'])
@jwt_required()
def get_properties():
    user_id = get_jwt_identity()
    properties = Property.query.filter_by(user_id=user_id).all()

    result = []
    for prop in properties:
        result.append({
            'id': prop.id,
            'name': prop.name,
            'description': prop.description,
            'type': prop.type.value,
            'area_sqm': prop.area_sqm,
            'green_area_sqm': prop.green_area_sqm,
            'width_m': prop.width_m,
            'height_m': prop.height_m,
            'sun_exposure': prop.sun_exposure.value,
            'soil_type': prop.soil_type.value if prop.soil_type else None,
            'region': prop.region,
            'created_at': prop.created_at
        })

    return jsonify(result), 200


@properties_bp.route('/properties/<int:id>', methods=['GET'])
@jwt_required()
def get_property(id):
    user_id = get_jwt_identity()
    prop = Property.query.filter_by(id=id, user_id=user_id).first()

    if not prop:
        return jsonify({'message': 'Имотът не е намерен!'}), 404

    return jsonify({
        'id': prop.id,
        'name': prop.name,
        'description': prop.description,
        'type': prop.type.value,
        'area_sqm': prop.area_sqm,
        'width_m': prop.width_m,
        'height_m': prop.height_m,
        'sun_exposure': prop.sun_exposure.value,
        'soil_type': prop.soil_type.value if prop.soil_type else None,
        'region': prop.region,
        'created_at': prop.created_at
    }), 200


@properties_bp.route('/properties', methods=['POST'])
@jwt_required()
def create_property():
    user_id = get_jwt_identity()
    data = request.get_json()

    # Валидация на задължителните полета
    required_fields = ['name', 'type', 'area_sqm', 'sun_exposure', 'region']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'message': f'Полето {field} е задължително!'}), 400

    # Валидация на area_sqm
    if float(data['area_sqm']) <= 0:
        return jsonify({'message': 'Площта трябва да е положително число!'}), 400

    # Валидация на enums
    try:
        property_type = PropertyTypeEnum[data['type']]
        sun_exposure = SunExposureEnum[data['sun_exposure']]
        soil_type = SoilTypeEnum[data['soil_type']] if data.get('soil_type') else None
    except KeyError:
        return jsonify({'message': 'Невалидна стойност за type, sun_exposure или soil_type!'}), 400

    # Валидация на green_area_sqm
    if data.get('green_area_sqm'):
        if float(data['green_area_sqm']) > float(data['area_sqm']):
            return jsonify({'message': 'Площта за озеленяване не може да е по-голяма от общата площ!'}), 400

    prop = Property(
        user_id=user_id,
        name=data['name'],
        description=data.get('description'),
        type=property_type,
        area_sqm=float(data['area_sqm']),
        width_m=float(data['width_m']) if data.get('width_m') else None,
        height_m=float(data['height_m']) if data.get('height_m') else None,
        sun_exposure=sun_exposure,
        soil_type=soil_type,
        region=data['region']
    )

    db.session.add(prop)
    db.session.commit()

    return jsonify({'message': 'Имотът е създаден успешно!', 'id': prop.id}), 201


@properties_bp.route('/properties/<int:id>', methods=['PUT'])
@jwt_required()
def update_property(id):
    user_id = get_jwt_identity()
    prop = Property.query.filter_by(id=id, user_id=user_id).first()

    if not prop:
        return jsonify({'message': 'Имотът не е намерен!'}), 404

    data = request.get_json()

    # Валидация на enums ако са подадени
    try:
        if data.get('type'):
            prop.type = PropertyTypeEnum[data['type']]
        if data.get('sun_exposure'):
            prop.sun_exposure = SunExposureEnum[data['sun_exposure']]
        if data.get('soil_type'):
            prop.soil_type = SoilTypeEnum[data['soil_type']]
    except KeyError:
        return jsonify({'message': 'Невалидна стойност за type, sun_exposure или soil_type!'}), 400

    prop.name = data.get('name', prop.name)
    prop.description = data.get('description', prop.description)
    new_area = float(data.get('area_sqm', prop.area_sqm))
    new_green = float(data['green_area_sqm']) if data.get('green_area_sqm') else prop.green_area_sqm
    if new_green and new_green > new_area:
        return jsonify({'message': 'Площта за озеленяване не може да е по-голяма от общата площ!'}), 400
    prop.area_sqm = new_area
    prop.green_area_sqm = new_green
    prop.width_m = data.get('width_m', prop.width_m)
    prop.height_m = data.get('height_m', prop.height_m)
    prop.region = data.get('region', prop.region)

    db.session.commit()

    return jsonify({'message': 'Имотът е обновен успешно!'}), 200


@properties_bp.route('/properties/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_property(id):
    user_id = get_jwt_identity()
    prop = Property.query.filter_by(id=id, user_id=user_id).first()

    if not prop:
        return jsonify({'message': 'Имотът не е намерен!'}), 404

    # Изтриваме свързаните планове и елементите им
    plans = GardenPlan.query.filter_by(property_id=id).all()
    for plan in plans:
        PlanItem.query.filter_by(plan_id=plan.id).delete()
        db.session.delete(plan)

    db.session.delete(prop)
    db.session.commit()

    return jsonify({'message': 'Имотът е изтрит успешно!'}), 200