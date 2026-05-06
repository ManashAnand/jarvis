import logging
import colorlog


handler = colorlog.StreamHandler()

handler.setFormatter(
    colorlog.ColoredFormatter(
        (
            "%(log_color)s"
            "%(asctime)s | "
            "%(levelname)s | "
            "%(name)s | "
            "%(filename)s:%(lineno)d | "
            "%(funcName)s() | "
            "%(message)s"
        ),
        log_colors={
            "DEBUG": "cyan",
            "INFO": "green",
            "WARNING": "yellow",
            "ERROR": "red",
            "CRITICAL": "bold_red",
        }
    )
)

logger = colorlog.getLogger("jarvis")

logger.addHandler(handler)

logger.setLevel(logging.INFO)