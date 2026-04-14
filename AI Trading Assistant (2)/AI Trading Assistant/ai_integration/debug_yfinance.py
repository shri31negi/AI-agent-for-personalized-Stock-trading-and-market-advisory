import sys
import traceback
from services.market_data_service import get_stock_info

try:
    print(get_stock_info('AAPL'))
except Exception as e:
    traceback.print_exc()
