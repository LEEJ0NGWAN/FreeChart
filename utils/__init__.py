from redis import StrictRedis

redis = StrictRedis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    charset="utf-8",
    decode_responses=True
)

