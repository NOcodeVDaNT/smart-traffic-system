import time

class SignalController:
    def __init__(self):
        self.current_phase = "NS"
        self.current_state = "GREEN"
        self.remaining_time = 0
        self.green_times = {"phase_NS": 30, "phase_EW": 30}

        self.yellow_time = 1
        self.all_red_time = 2

        self.last_update = time.time()

    def update_green_times(self, green_times):
        self.green_times = green_times
        self.current_phase = "NS"
        self.current_state = "GREEN"
        self.remaining_time = self.green_times["phase_NS"]
        self.last_update = time.time()

    def tick(self):
        now = time.time()
        elapsed = int(now - self.last_update)

        if elapsed > 0:
            self.remaining_time -= elapsed
            self.last_update = now

            if self.remaining_time <= 0:
                self.transition()

    def transition(self):
        if self.current_state == "GREEN":
            self.current_state = "YELLOW"
            self.remaining_time = self.yellow_time

        elif self.current_state == "YELLOW":
            self.current_state = "ALL_RED"
            self.remaining_time = self.all_red_time

        elif self.current_state == "ALL_RED":
            # Switch phase
            if self.current_phase == "NS":
                self.current_phase = "EW"
                self.remaining_time = self.green_times["phase_EW"]
            else:
                self.current_phase = "NS"
                self.remaining_time = self.green_times["phase_NS"]

            self.current_state = "GREEN"

    def get_status(self):
        self.tick()
        return {
            "current_phase": self.current_phase,
            "current_state": self.current_state,
            "remaining_time": max(self.remaining_time, 0)
        }
