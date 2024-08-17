$(function () {
    // Mode toggle logic
    $("#modeToggle").change(function() {
        if ($(this).is(":checked")) {
            $("body").removeClass("light").addClass("dark");
            $(".navbar").removeClass("navbar-light bg-light").addClass("navbar-dark bg-dark");
            $("#modeIcon").removeClass("bi-sun").addClass("bi-moon");
            $.cookie('mode', 'dark', { expires: 7 });
        } else {
            $("body").removeClass("dark").addClass("light");
            $(".navbar").removeClass("navbar-dark bg-dark").addClass("navbar-light bg-light");
            $("#modeIcon").removeClass("bi-moon").addClass("bi-sun");
            $.cookie('mode', 'light', { expires: 7 });
        }
    });

    // Check for saved mode on page load
    if ($.cookie('mode') === 'dark') {
        $("#modeToggle").prop("checked", true).trigger("change");
    }

    // Load page content dynamically
    function LoadPage(pageName){
        $.ajax({
            method: 'get',
            url: `../../public/${pageName}`,
            success: (response) => {
                $("section").show();
                $("section").html(response);
                $("#btnContainer").hide();
            }
        });
    }

    $(function(){
        $("#btnRegister").click(()=>{
            LoadPage('register-user.html');
        });

        $("#btnSignin").click(()=>{
            LoadPage('signin-user.html');
        });

        $(document).on("click", "#btnCancel", ()=>{
            $("#btnContainer").show();
            $("section").hide();
        });

        function LoadDashBoardData(){
            $.ajax({
                method: 'get',
                url: 'http://127.0.0.1:6600/get-users',
                success: (users) => {
                    var user = users.find(user => user.UserId == $("#Login-UserId").val());
                    if (user) {
                        $.cookie('userid', user.UserId);
                        $.cookie('username', user.UserName);
                        LoadPage('dashboard-user.html');
                        $.ajax({
                            method: 'get',
                            url: `http://127.0.0.1:6600/get-task/${user.UserId}`,
                            success: (tasks) => {
                                $("#lblUserId").html($.cookie('username'));
                                tasks.forEach(task => {
                                    $(`
                                        <div class="alert m-2 alert-success alert-dismissible">
                                            <h4>${task.Title}</h4>
                                            <p>${task.Description}</p>
                                            <div><span class="bi bi-calendar-event"> ${task.Date.toString()} </span></div><br>
                                            <button data-bs-toggle="modal" data-bs-target="#edit-task" value=${task.AppointmentId} id="btnEditTask" class="btn btn-warning bi bi-pen-fill">Edit Task</button>
                                            <button value=${task.AppointmentId} id="btnDeleteTask" class="btn btn-danger bi bi-trash-fill">Delete Task</button>
                                        </div>
                                    `).appendTo("main");
                                });
                            }
                        });
                    }
                }
            });
        }

        $(document).on("submit", "#loginForm", (e) => {
            e.preventDefault(); // Prevent the default form submission

            $.ajax({
                method: 'get',
                url: 'http://127.0.0.1:6600/get-users',
                success: (users) => {
                    var user = users.find(user => user.UserId == $("#Login-UserId").val());
                    if (user && user.Password == $("#Login-Password").val()) {
                        LoadDashBoardData();
                    } else {
                        alert('Invalid User Id or Password');
                    }
                }
            });
        });

        $(document).on("click", "#btnSignout", () => {
            $.removeCookie('userid');
            $.removeCookie('username');
            LoadPage('signin-user.html');
        });

        $(document).on("click", "#btnFrmRegister", () => {
            var user = {
                UserId: $("#UserId").val(),
                UserName: $("#UserName").val(),
                Password: $("#Password").val(),
                Email: $("#Email").val(),
                Mobile: $("#Mobile").val()
            };

            $.ajax({
                method: 'post',
                url: 'http://127.0.0.1:6600/register-user',
                data: user,
                success: () => {
                    alert('Registered Successfully..');
                    LoadPage('signin-user.html');
                }
            });
        });

        function LoadMain(){
            $("main").html('');
            $.ajax({
                method: 'get',
                url: `http://127.0.0.1:6600/get-task/${$.cookie('userid')}`,
                success: (tasks) => {
                    $("#lblUserId").html($.cookie('username'));
                    tasks.forEach(task => {
                        $(`
                            <div class="alert alert-success alert-dismissible">
                                <h4>${task.Title}</h4>
                                <p>${task.Description}</p>
                                <div><span class="bi bi-calendar-event"> ${task.Date.toString()} </span></div><br>
                                <button data-bs-toggle="modal" data-bs-target="#edit-task" value=${task.AppointmentId} id="btnEditTask" class="btn btn-warning bi bi-pen-fill"> Edit Task</button>
                                <button value=${task.AppointmentId} id="btnDeleteTask" class="btn btn-danger bi bi-trash-fill"> Delete Task</button>
                            </div>
                        `).appendTo("main");
                    });
                }
            });
        }

        $(document).on("click", "#btnAddAppointment", () => {
            var task = {
                AppointmentId: $("#Add_AppointmentId").val(),
                Title: $("#Add_Title").val(),
                Description: $("#Add_Description").val(),
                Date: new Date($("#Add_Date").val()),
                UserId: $.cookie('userid')
            };

            $.ajax({
                method: 'post',
                url: 'http://127.0.0.1:6600/add-task',
                data: task,
                success: () => {
                    alert('Appointment Added Successfully..');
                    LoadMain();
                }
            });
        });

        $(document).on("click", "#btnDeleteTask", (e) => {
            var id = parseInt(e.target.value);
            var choice = confirm("Are you sure?\nWant to Delete?");
            if (choice) {
                $.ajax({
                    method: 'delete',
                    url: `http://127.0.0.1:6600/delete-task/${id}`,
                    success: () => {
                        LoadMain();
                    }
                });
            }
        });

        $(document).on("click", "#btnEditTask", (e) => {
            $.ajax({
                method: 'get',
                url: `http://127.0.0.1:6600/get-appointment/${e.target.value}`,
                success: (tasks) => {
                    var editDateStr = tasks[0].Date;
                    $("#Edit_AppointmentId").val(tasks[0].AppointmentId);
                    $("#Edit_Title").val(tasks[0].Title);
                    $("#Edit_Description").val(tasks[0].Description);
                    $("#Edit_Date").val(new Date(editDateStr).toISOString().split('T')[0]); // Correct date formatting
                }
            });
        });

        $(document).on("click", "#btnSaveAppointment", () => {
            var task = {
                AppointmentId: $("#Edit_AppointmentId").val(),
                Title: $("#Edit_Title").val(),
                Description: $("#Edit_Description").val(),
                Date: new Date($("#Edit_Date").val()),
                UserId: $.cookie('userid')
            };

            $.ajax({
                method: 'put',
                url: `http://127.0.0.1:6600/update-task/${$("#Edit_AppointmentId").val()}`,
                data: task,
                success: () => {
                    alert('Task Updated Successfully..');
                    LoadMain();
                }
            });
        });
    });
});
