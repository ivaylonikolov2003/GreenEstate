from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import io
from datetime import datetime
import os

# Регистриране на кирилски шрифт
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTS_DIR = os.path.join(BASE_DIR, 'fonts')

pdfmetrics.registerFont(TTFont('DejaVu', os.path.join(FONTS_DIR, 'DejaVuSans.ttf')))
pdfmetrics.registerFont(TTFont('DejaVu-Bold', os.path.join(FONTS_DIR, 'DejaVuSans-Bold.ttf')))

# Преводи
type_translations = {
    'HOUSE': 'Къща',
    'APARTMENT': 'Апартамент',
    'VILLA': 'Вила'
}

sun_translations = {
    'FULL_SUN': 'Слънчево',
    'PARTIAL_SUN': 'Частично слънчево',
    'SHADE': 'Сянка'
}

soil_translations = {
    'CLAY': 'Глинеста',
    'SANDY': 'Песъчлива',
    'LOAMY': 'Глинесто-песъчлива',
    'ROCKY': 'Камениста'
}


def generate_offer_pdf(user, prop, plan, items_details, total):
    buffer = io.BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm
    )

    elements = []
    styles = getSampleStyleSheet()

    # Стилове
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#2d5a27'),
        spaceAfter=5,
        alignment=1,
        fontName='DejaVu-Bold'
    )

    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Normal'],
        fontSize=13,
        textColor=colors.HexColor('#4a4a4a'),
        spaceAfter=10,
        fontName='DejaVu-Bold'
    )

    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        textColor=colors.HexColor('#333333'),
        spaceAfter=5,
        fontName='DejaVu'
    )

    # Заглавие
    elements.append(Paragraph('GreenEstate', title_style))
    elements.append(Paragraph('Оферта за озеленяване', ParagraphStyle(
        'OfferTitle',
        parent=styles['Normal'],
        fontSize=14,
        textColor=colors.HexColor('#2d5a27'),
        spaceAfter=20,
        alignment=1,
        fontName='DejaVu'
    )))
    elements.append(Spacer(1, 0.5*cm))

    # Линия
    elements.append(Table(
        [['']],
        colWidths=[17*cm],
        style=TableStyle([
            ('LINEBELOW', (0,0), (-1,-1), 2, colors.HexColor('#2d5a27'))
        ])
    ))
    elements.append(Spacer(1, 0.5*cm))

    # Информация за клиента
    elements.append(Paragraph('Информация за клиента', subtitle_style))
    client_data = [
        ['Име:', f'{user.first_name} {user.last_name}'],
        ['Имейл:', user.email],
        ['Дата:', datetime.now().strftime('%d.%m.%Y %H:%M')]
    ]
    client_table = Table(client_data, colWidths=[4*cm, 13*cm])
    client_table.setStyle(TableStyle([
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('TEXTCOLOR', (0,0), (0,-1), colors.HexColor('#2d5a27')),
        ('FONTNAME', (0,0), (0,-1), 'DejaVu-Bold'),
        ('FONTNAME', (1,0), (1,-1), 'DejaVu'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(client_table)
    elements.append(Spacer(1, 0.5*cm))

    # Информация за имота
    elements.append(Paragraph('Информация за имота', subtitle_style))
    property_data = [
        ['Имот:', prop.name],
        ['Тип:', type_translations.get(prop.type.value, prop.type.value)],
        ['Площ:', f'{prop.area_sqm} кв.м.'],
        ['Регион:', prop.region],
        ['Изложение:', sun_translations.get(prop.sun_exposure.value, prop.sun_exposure.value)],
        ['Тип почва:', soil_translations.get(prop.soil_type.value, 'Не е зададен') if prop.soil_type else 'Не е зададен']
    ]
    property_table = Table(property_data, colWidths=[4*cm, 13*cm])
    property_table.setStyle(TableStyle([
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('TEXTCOLOR', (0,0), (0,-1), colors.HexColor('#2d5a27')),
        ('FONTNAME', (0,0), (0,-1), 'DejaVu-Bold'),
        ('FONTNAME', (1,0), (1,-1), 'DejaVu'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(property_table)
    elements.append(Spacer(1, 0.5*cm))

    # Информация за плана
    elements.append(Paragraph(f'План: {plan.name}', subtitle_style))
    if plan.description:
        # Почистваме метаданните <<{...}>> от описанието
        import re
        clean_desc = re.sub(r'^<<\{.*?\}>>\s*', '', plan.description).strip()
        if clean_desc:
            elements.append(Paragraph(clean_desc, normal_style))

    # Бюджет — винаги показваме
    if plan.budget:
        elements.append(Paragraph(f'Бюджет: {plan.budget} EUR', normal_style))
    else:
        elements.append(Paragraph('Бюджет: Не е зададен', normal_style))

    elements.append(Spacer(1, 0.3*cm))

    # Таблица с растенията
    table_data = [['Растение', 'Количество', 'Цена/бр.', 'Сума']]

    for item in items_details:
        table_data.append([
            item['plant_name'],
            f"{item['recommended_quantity']} бр.",
            f"{item['price_per_unit']} EUR",
            f"{item['item_total']} EUR"
        ])

    table_data.append(['', '', 'ОБЩО:', f'{total} EUR'])

    plants_table = Table(
        table_data,
        colWidths=[6*cm, 4*cm, 3.5*cm, 3.5*cm]
    )
    plants_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#2d5a27')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'DejaVu-Bold'),
        ('FONTSIZE', (0,0), (-1,0), 11),
        ('ALIGN', (0,0), (-1,0), 'CENTER'),
        ('BOTTOMPADDING', (0,0), (-1,0), 10),
        ('TOPPADDING', (0,0), (-1,0), 10),

        ('FONTNAME', (0,1), (-1,-1), 'DejaVu'),
        ('FONTSIZE', (0,1), (-1,-2), 10),
        ('ROWBACKGROUNDS', (0,1), (-1,-2), [colors.white, colors.HexColor('#f5f9f5')]),
        ('ALIGN', (1,1), (-1,-1), 'CENTER'),
        ('BOTTOMPADDING', (0,1), (-1,-2), 8),
        ('TOPPADDING', (0,1), (-1,-2), 8),

        ('FONTNAME', (2,-1), (-1,-1), 'DejaVu-Bold'),
        ('FONTSIZE', (0,-1), (-1,-1), 11),
        ('TEXTCOLOR', (2,-1), (-1,-1), colors.HexColor('#2d5a27')),
        ('TOPPADDING', (0,-1), (-1,-1), 10),
        ('BOTTOMPADDING', (0,-1), (-1,-1), 10),

        ('GRID', (0,0), (-1,-2), 0.5, colors.HexColor('#cccccc')),
        ('LINEABOVE', (0,-1), (-1,-1), 1.5, colors.HexColor('#2d5a27')),
    ]))
    elements.append(plants_table)
    elements.append(Spacer(1, 1*cm))

    # Бюджет статус
    if plan.budget:
        if total <= float(plan.budget):
            budget_text = f'Офертата е в рамките на бюджета. Остават {round(float(plan.budget) - total, 2)} EUR.'
            budget_color = colors.HexColor('#2d5a27')
        else:
            budget_text = f'Офертата надвишава бюджета с {round(total - float(plan.budget), 2)} EUR.'
            budget_color = colors.red

        budget_style = ParagraphStyle(
            'BudgetStyle',
            parent=styles['Normal'],
            fontSize=11,
            textColor=budget_color,
            spaceAfter=10,
            fontName='DejaVu-Bold'
        )
        elements.append(Paragraph(budget_text, budget_style))
        elements.append(Spacer(1, 0.5*cm))

    # Footer
    elements.append(Table(
        [['']],
        colWidths=[17*cm],
        style=TableStyle([
            ('LINEABOVE', (0,0), (-1,-1), 1, colors.HexColor('#2d5a27'))
        ])
    ))
    elements.append(Spacer(1, 0.3*cm))
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=colors.HexColor('#888888'),
        alignment=1,
        fontName='DejaVu'
    )
    elements.append(Paragraph(
        f'Генерирано от GreenEstate | {datetime.now().strftime("%d.%m.%Y %H:%M")}',
        footer_style
    ))

    doc.build(elements)
    buffer.seek(0)
    return buffer