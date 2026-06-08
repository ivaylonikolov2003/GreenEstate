import enum

class RoleEnum(enum.Enum):
    USER = 'USER'
    ADMIN = 'ADMIN'

class PropertyTypeEnum(enum.Enum):
    HOUSE = 'HOUSE'
    APARTMENT = 'APARTMENT'
    VILLA = 'VILLA'

class SunExposureEnum(enum.Enum):
    FULL_SUN = 'FULL_SUN'
    PARTIAL_SUN = 'PARTIAL_SUN'
    SHADE = 'SHADE'

class SoilTypeEnum(enum.Enum):
    CLAY = 'CLAY'
    SANDY = 'SANDY'
    LOAMY = 'LOAMY'
    ROCKY = 'ROCKY'

class WaterNeedsEnum(enum.Enum):
    LOW = 'LOW'
    MEDIUM = 'MEDIUM'
    HIGH = 'HIGH'

class SeasonEnum(enum.Enum):
    SPRING = 'SPRING'
    SUMMER = 'SUMMER'
    AUTUMN = 'AUTUMN'
    WINTER = 'WINTER'
    ALL_YEAR = 'ALL_YEAR'

class CareDifficultyEnum(enum.Enum):
    EASY = 'EASY'
    MEDIUM = 'MEDIUM'
    HARD = 'HARD'