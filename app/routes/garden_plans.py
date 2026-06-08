from flask import Blueprint, request, jsonify, send_file
from app import db
from app.models.garden_plan import GardenPlan, PlanItem
from app.models.property import Property
from app.models.plant import Plant
from app.pdf_generator import generate_offer_pdf
from app.models.user import User
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

garden_plans_bp = Blueprint('garden_plans', __name__)


@garden_plans_bp.route('/garden_plans', methods=['GET'])
@jwt_required()
def get_garden_plans():
    user_id = get_jwt_identity()
    property_id = request.args.get('property_id')

    if not property_id:
        return jsonify({'message': 'property_id е задължителен!'}), 400

    if not property_id.isdigit():
        return jsonify({'message': 'property_id трябва да е число!'}), 400

    prop = Property.query.filter_by(id=property_id, user_id=user_id).first()

    if not prop:
        return jsonify({'message': 'Имотът не е намерен!'}), 404

    plans = GardenPlan.query.filter_by(property_id=property_id).all()

    result = []
    for plan in plans:
        result.append({
            'id': plan.id,
            'name': plan.name,
            'description': plan.description,
            'grid_width': plan.grid_width,
            'grid_height': plan.grid_height,
            'created_at': plan.created_at,
            'items': [{
                'id': item.id,
                'plant_id': item.plant_id,
                'plant_name': item.plant.name,
                'position_x': item.position_x,
                'position_y': item.position_y,
                'note': item.note
            } for item in plan.plan_items]
        })

    return jsonify(result), 200


@garden_plans_bp.route('/garden_plans/<int:id>', methods=['GET'])
@jwt_required()
def get_garden_plan(id):
    user_id = get_jwt_identity()

    plan = db.session.get(GardenPlan, id)

    if not plan:
        return jsonify({'message': 'Планът не е намерен!'}), 404

    # Проверка дали имотът принадлежи на потребителя
    prop = Property.query.filter_by(id=plan.property_id, user_id=user_id).first()
    if not prop:
        return jsonify({'message': 'Нямате достъп до този план!'}), 403

    return jsonify({
        'id': plan.id,
        'name': plan.name,
        'description': plan.description,
        'grid_width': plan.grid_width,
        'grid_height': plan.grid_height,
        'created_at': plan.created_at,
        'items': [{
            'id': item.id,
            'plant_id': item.plant_id,
            'plant_name': item.plant.name,
            'position_x': item.position_x,
            'position_y': item.position_y,
            'note': item.note
        } for item in plan.plan_items]
    }), 200


@garden_plans_bp.route('/garden_plans', methods=['POST'])
@jwt_required()
def create_garden_plan():
    user_id = get_jwt_identity()
    data = request.get_json()

    # Валидация на задължителните полета
    required_fields = ['name', 'property_id']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'message': f'Полето {field} е задължително!'}), 400

    # Проверка дали имотът принадлежи на потребителя
    prop = Property.query.filter_by(id=data['property_id'], user_id=user_id).first()
    if not prop:
        return jsonify({'message': 'Имотът не е намерен!'}), 404

    # Валидация на grid размерите
    grid_width = data.get('grid_width', 10)
    grid_height = data.get('grid_height', 10)

    if grid_width <= 0 or grid_height <= 0:
        return jsonify({'message': 'Размерите на мрежата трябва да са положителни числа!'}), 400

    if grid_width > 50 or grid_height > 50:
        return jsonify({'message': 'Размерите на мрежата не могат да надвишават 50!'}), 400

    plan = GardenPlan(
        property_id=data['property_id'],
        name=data['name'],
        description=data.get('description'),
        grid_width=grid_width,
        grid_height=grid_height,
        budget=data.get('budget')
    )

    db.session.add(plan)
    db.session.commit()

    return jsonify({'message': 'Планът е създаден успешно!', 'id': plan.id}), 201


@garden_plans_bp.route('/garden_plans/<int:id>/items', methods=['POST'])
@jwt_required()
def add_plan_item(id):
    user_id = get_jwt_identity()

    plan = db.session.get(GardenPlan, id)
    if not plan:
        return jsonify({'message': 'Планът не е намерен!'}), 404

    # Проверка дали имотът принадлежи на потребителя
    prop = Property.query.filter_by(id=plan.property_id, user_id=user_id).first()
    if not prop:
        return jsonify({'message': 'Нямате достъп до този план!'}), 403

    data = request.get_json()

    # Валидация на задължителните полета
    required_fields = ['plant_id', 'position_x', 'position_y']
    for field in required_fields:
        if field not in data:
            return jsonify({'message': f'Полето {field} е задължително!'}), 400

    # Валидация на position_x и position_y да са числа
    if not isinstance(data.get('position_x'), int) or not isinstance(data.get('position_y'), int):
        return jsonify({'message': 'position_x и position_y трябва да са цели числа!'}), 400

    # Проверка дали растението съществува
    plant = db.session.get(Plant, data['plant_id'])
    if not plant:
        return jsonify({'message': 'Растението не е намерено!'}), 404

    # Максимален брой растения в план
    existing_items = PlanItem.query.filter_by(plan_id=id).count()
    if existing_items >= plan.grid_width * plan.grid_height:
        return jsonify({'message': 'Планът е пълен!'}), 400

    # Валидация на позицията
    if data['position_x'] < 0 or data['position_x'] >= plan.grid_width:
        return jsonify({'message': f'position_x трябва да е между 0 и {plan.grid_width - 1}!'}), 400

    if data['position_y'] < 0 or data['position_y'] >= plan.grid_height:
        return jsonify({'message': f'position_y трябва да е между 0 и {plan.grid_height - 1}!'}), 400

    # Проверка дали позицията е заета
    existing_item = PlanItem.query.filter_by(
        plan_id=id,
        position_x=data['position_x'],
        position_y=data['position_y']
    ).first()

    if existing_item:
        return jsonify({'message': 'Тази позиция вече е заета!'}), 400

    item = PlanItem(
        plan_id=id,
        plant_id=data['plant_id'],
        position_x=data['position_x'],
        position_y=data['position_y'],
        note=data.get('note')
    )

    db.session.add(item)
    db.session.commit()

    return jsonify({
        'message': 'Растението е добавено към плана!',
        'id': item.id
    }), 201


@garden_plans_bp.route('/garden_plans/<int:id>/items/<int:item_id>', methods=['DELETE'])
@jwt_required()
def delete_plan_item(id, item_id):
    user_id = get_jwt_identity()

    plan = db.session.get(GardenPlan, id)
    if not plan:
        return jsonify({'message': 'Планът не е намерен!'}), 404

    # Проверка дали имотът принадлежи на потребителя
    prop = Property.query.filter_by(id=plan.property_id, user_id=user_id).first()
    if not prop:
        return jsonify({'message': 'Нямате достъп до този план!'}), 403

    item = PlanItem.query.filter_by(id=item_id, plan_id=id).first()
    if not item:
        return jsonify({'message': 'Елементът не е намерен!'}), 404

    db.session.delete(item)
    db.session.commit()

    return jsonify({'message': 'Растението е премахнато от плана!'}), 200


@garden_plans_bp.route('/garden_plans/<int:id>', methods=['PUT'])
@jwt_required()
def update_garden_plan(id):
    user_id = get_jwt_identity()

    plan = db.session.get(GardenPlan, id)
    if not plan:
        return jsonify({'message': 'Планът не е намерен!'}), 404

    prop = Property.query.filter_by(id=plan.property_id, user_id=user_id).first()
    if not prop:
        return jsonify({'message': 'Нямате достъп до този план!'}), 403

    data = request.get_json()

    plan.name = data.get('name', plan.name)
    plan.description = data.get('description', plan.description)

    db.session.commit()

    return jsonify({'message': 'Планът е обновен успешно!'}), 200

@garden_plans_bp.route('/garden_plans/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_garden_plan(id):
    user_id = get_jwt_identity()

    plan = db.session.get(GardenPlan, id)
    if not plan:
        return jsonify({'message': 'Планът не е намерен!'}), 404

    prop = Property.query.filter_by(id=plan.property_id, user_id=user_id).first()
    if not prop:
        return jsonify({'message': 'Нямате достъп до този план!'}), 403

    # Изтриване на всички елементи от плана
    PlanItem.query.filter_by(plan_id=id).delete()
    db.session.delete(plan)
    db.session.commit()

    return jsonify({'message': 'Планът е изтрит успешно!'}), 200

@garden_plans_bp.route('/garden_plans/<int:id>/total', methods=['GET'])
@jwt_required()
def get_plan_total(id):
    user_id = get_jwt_identity()

    plan = db.session.get(GardenPlan, id)
    if not plan:
        return jsonify({'message': 'Планът не е намерен!'}), 404

    prop = Property.query.filter_by(id=plan.property_id, user_id=user_id).first()
    if not prop:
        return jsonify({'message': 'Нямате достъп до този план!'}), 403

    # Броим клетките по вид растение
    plant_counts = {}
    for item in plan.plan_items:
        plant = item.plant
        if plant.id not in plant_counts:
            plant_counts[plant.id] = {
                'plant_name': plant.name,
                'price_per_unit': float(plant.price),
                'count': 0
            }
        plant_counts[plant.id]['count'] += 1

    # Изчисляване на сумата
    total = 0
    items_details = []
    for plant_id, data in plant_counts.items():
        item_total = data['price_per_unit'] * data['count']
        total += item_total
        items_details.append({
            'plant_name': data['plant_name'],
            'price_per_unit': data['price_per_unit'],
            'count': data['count'],
            'item_total': round(item_total, 2)
        })

    total = round(total, 2)

    # Проверка на бюджет
    budget_status = None
    if plan.budget:
        if total <= float(plan.budget):
            budget_status = f'В рамките на бюджета — остават {round(float(plan.budget) - total, 2)} EUR'
        else:
            budget_status = f'Надвишава бюджета с {round(total - float(plan.budget), 2)} EUR'

    return jsonify({
        'plan_id': plan.id,
        'plan_name': plan.name,
        'budget': float(plan.budget) if plan.budget else None,
        'budget_status': budget_status,
        'items': items_details,
        'total': total,
        'currency': 'EUR'
    }), 200


@garden_plans_bp.route('/garden_plans/<int:id>/quantity', methods=['GET'])
@jwt_required()
def get_recommended_quantity(id):
    user_id = get_jwt_identity()

    plan = db.session.get(GardenPlan, id)
    if not plan:
        return jsonify({'message': 'Планът не е намерен!'}), 404

    prop = Property.query.filter_by(id=plan.property_id, user_id=user_id).first()
    if not prop:
        return jsonify({'message': 'Нямате достъп до този план!'}), 403

    result = []
    for item in plan.plan_items:
        plant = item.plant
        recommended_quantity = float(prop.area_sqm) * float(plant.quantity_per_sqm)
        result.append({
            'plant_id': plant.id,
            'plant_name': plant.name,
            'area_sqm': float(prop.area_sqm),
            'quantity_per_sqm': float(plant.quantity_per_sqm),
            'recommended_quantity': round(recommended_quantity, 2),
            'unit': 'броя'
        })

    return jsonify({
        'plan_id': plan.id,
        'plan_name': plan.name,
        'property_area': float(prop.area_sqm),
        'recommendations': result
    }), 200

@garden_plans_bp.route('/garden_plans/<int:id>/pdf', methods=['GET'])
@jwt_required()
def generate_pdf(id):
    user_id = get_jwt_identity()

    plan = db.session.get(GardenPlan, id)
    if not plan:
        return jsonify({'message': 'Планът не е намерен!'}), 404

    prop = Property.query.filter_by(id=plan.property_id, user_id=user_id).first()
    if not prop:
        return jsonify({'message': 'Нямате достъп до този план!'}), 403

    user = db.session.get(User, user_id)

    # Броим клетките по вид растение
    plant_counts = {}
    for item in plan.plan_items:
        plant = item.plant
        if plant.id not in plant_counts:
            plant_counts[plant.id] = {
                'plant_name': plant.name,
                'price_per_unit': float(plant.price),
                'count': 0
            }
        plant_counts[plant.id]['count'] += 1

    total = 0
    items_details = []
    for plant_id, data in plant_counts.items():
        item_total = data['price_per_unit'] * data['count']
        total += item_total
        items_details.append({
            'plant_name': data['plant_name'],
            'price_per_unit': data['price_per_unit'],
            'recommended_quantity': data['count'],
            'item_total': round(item_total, 2)
        })

    total = round(total, 2)

    pdf_buffer = generate_offer_pdf(user, prop, plan, items_details, total)

    return send_file(
        pdf_buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f'оферта_{plan.name}_{datetime.now().strftime("%d%m%Y")}.pdf'
    )

@garden_plans_bp.route('/garden_plans/<int:id>/canvas', methods=['GET'])
@jwt_required()
def get_canvas_elements(id):
    user_id = get_jwt_identity()

    plan = db.session.get(GardenPlan, id)
    if not plan:
        return jsonify({'message': 'Планът не е намерен!'}), 404

    prop = Property.query.filter_by(id=plan.property_id, user_id=user_id).first()
    if not prop:
        return jsonify({'message': 'Нямате достъп до този план!'}), 403

    import json
    canvas_data = {'zones': [], 'points': [], 'lines': []}
    if plan.canvas_elements:
        try:
            canvas_data = json.loads(plan.canvas_elements)
        except Exception:
            pass

    return jsonify(canvas_data), 200


@garden_plans_bp.route('/garden_plans/<int:id>/canvas', methods=['PUT'])
@jwt_required()
def save_canvas_elements(id):
    user_id = get_jwt_identity()

    plan = db.session.get(GardenPlan, id)
    if not plan:
        return jsonify({'message': 'Планът не е намерен!'}), 404

    prop = Property.query.filter_by(id=plan.property_id, user_id=user_id).first()
    if not prop:
        return jsonify({'message': 'Нямате достъп до този план!'}), 403

    import json
    data = request.get_json()
    plan.canvas_elements = json.dumps(data)
    db.session.commit()

    return jsonify({'message': 'Canvas елементите са запазени!'}), 200


@garden_plans_bp.route('/garden_plans/<int:id>/pdf_canvas', methods=['POST'])
@jwt_required()
def generate_pdf_canvas(id):
    """PDF оферта базирана на canvas данните (зони, обекти) а не на plan_items."""
    user_id = get_jwt_identity()

    plan = db.session.get(GardenPlan, id)
    if not plan:
        return jsonify({'message': 'Планът не е намерен!'}), 404

    prop = Property.query.filter_by(id=plan.property_id, user_id=user_id).first()
    if not prop:
        return jsonify({'message': 'Нямате достъп до този план!'}), 403

    user = db.session.get(User, user_id)
    data = request.get_json()

    items_details = data.get('items_details', [])
    total = float(data.get('total', 0))

    pdf_buffer = generate_offer_pdf(user, prop, plan, items_details, total)

    return send_file(
        pdf_buffer,
        mimetype='application/pdf',
        as_attachment=True,
        download_name=f'оферта_{plan.name}_{datetime.now().strftime("%d%m%Y")}.pdf'
    )