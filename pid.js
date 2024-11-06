// PID Object
class PID {
    constructor(Kp, Ki, Kd) {
        this.Kp = Kp;
        this.Ki = Ki;
        this.Kd = Kd;
        this.prevError = 0.0;
        this.integral = 0.0;
    }

    calculate(setpoint, measuredValue, dt) {
        // Calculate error
        const error = setpoint - measuredValue;

        // Proportional term
        const Pout = this.Kp * error;

        // Integral term
        this.integral += error * dt;
        const Iout = this.Ki * this.integral;

        // Derivative term
        const derivative = (error - this.prevError) / dt;
        const Dout = this.Kd * derivative;

        // Calculate total output
        const output = Pout + Iout + Dout;

        // Save error for next iteration
        this.prevError = error;

        return output;
    }

    reset() {
        this.prevError = 0.0;
        this.integral = 0.0;
        this.output = 0;
    }
    
    clearKi() {
        this.integral = 0.0;
    }
}
