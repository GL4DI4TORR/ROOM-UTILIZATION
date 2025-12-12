<div class="container-fluid">
    <div class="row">
        <div class="col-12">
            <div class="page-title-box">
                <h1 class="page-title">Room Utilization</h1>
            </div>
        </div>
    </div>
    <div class="card">
        <div class="card-body">
            <h2>Scheduled</h2>
            <div class="mb-0 me-2 d-flex gap-2">
                <button id="schedule-back" class="btn btn-outline-secondary">Back</button>
            </div>
            <div class="filter mt-3 d-flex flex-wrap gap-2 align-items-center">
                <select id="schedule-room" class="form-select w-auto d-inline-block me-2">
                    <option value="" selected>Select Room</option>
                </select>
                <select id="schedule-day" class="form-select w-auto d-inline-block me-2">
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                </select>
                <button id="schedule-continue" class="btn btn-primary brand-bg-color">Continue</button>
                <span class="text-muted small">Select room & day to see scheduled classes</span>
            </div>

    <table id="table-room-schedule" class="table table-bordered">
        <thead>
            <tr>
                <th class="time-slot">Time</th>
                <th>Monday</th>
                <th>Tuesday</th>
                <th>Wednesday</th>
                <th>Thursday</th>
                <th>Friday</th>
                <th>Saturday</th>
            </tr>
        </thead>
        <tbody>
            <!-- Time slots from 7 AM to 7 PM with 30-minute intervals -->
            <tr><td>7:00 AM</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>7:30 AM</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>8:00 AM</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>8:30 AM</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>9:00 AM</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>9:30 AM</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>10:00 AM</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>10:30 AM</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>11:00 AM</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>11:30 AM</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>12:00 PM</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>12:30 PM</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>1:00 PM</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>1:30 PM</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>2:00 PM</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>2:30 PM</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>3:00 PM</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>3:30 PM</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>4:00 PM</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>4:30 PM</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>5:00 PM</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>5:30 PM</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>6:00 PM</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>6:30 PM</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
            <tr><td>7:00 PM</td><td></td><td></td><td></td><td></td><td></td><td></td></tr>
        </tbody>
    </table>
        </div>
    </div>
</div>