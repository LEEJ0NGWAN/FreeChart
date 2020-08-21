from random import choice as random_choice
from string import ascii_uppercase, digits
from redis import StrictRedis
from FreeChart import settings

def id_generator(size=32, chars=ascii_uppercase + digits):
    return ''.join(random_choice(chars) for _ in range(size))

redis = StrictRedis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    charset="utf-8",
    decode_responses=True
)

