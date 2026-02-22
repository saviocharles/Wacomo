<?php
require_once 'includes/config.php';
require_once 'includes/db.php';
require_once 'includes/functions.php';

check_auth('USER');

$pageTitle = "User Dashboard";
$userId = $_SESSION['user_id'];

// Fetch assignments with commodity details
$stmt = $pdo->prepare("
    SELECT a.*, c.parsed_name, c.location as target_location, c.quantity as target_quantity, c.rate as target_rate, c.unit
    FROM assignments a
    JOIN commodities c ON a.commodity_id = c.id
    WHERE a.user_id = ?
    ORDER BY a.created_at DESC
");
$stmt->execute([$userId]);
$myTasks = $stmt->fetchAll();

include 'templates/header.php';
?>

<div class="space-y-8">
    <div class="flex justify-between items-center">
        <div>
            <h1 class="text-3xl font-bold text-slate-900 tracking-tight">My Assignments</h1>
            <p class="text-slate-500 mt-1">Manage your active sourcing tasks</p>
        </div>
    </div>

    <!-- Task List -->
    <div class="grid grid-cols-1 gap-6">
        <?php foreach ($myTasks as $task): ?>
        <div class="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div class="flex flex-col md:flex-row justify-between gap-4">
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2">
                        <h3 class="text-xl font-bold text-slate-900"><?php echo htmlspecialchars($task['parsed_name']); ?></h3>
                        <span class="px-2.5 py-1 rounded-full text-xs font-medium 
                            <?php 
                                echo $task['status'] === 'ASSIGNED' ? 'bg-blue-100 text-blue-700' : 
                                    ($task['status'] === 'WORK_IN_PROGRESS' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'); 
                            ?>">
                            <?php echo str_replace('_', ' ', $task['status']); ?>
                        </span>
                    </div>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-slate-600">
                        <div><span class="text-slate-400">Location:</span> <?php echo htmlspecialchars($task['target_location']); ?></div>
                        <div><span class="text-slate-400">Target Qty:</span> <?php echo $task['target_quantity'] . ' ' . $task['unit']; ?></div>
                        <div><span class="text-slate-400">Target Rate:</span> <?php echo $task['target_rate'] ? 'Rs.'.$task['target_rate'] : 'N/A'; ?></div>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <?php if ($task['status'] !== 'COMPLETED'): ?>
                    <button onclick="openUpdateModal('<?php echo $task['id']; ?>', '<?php echo addslashes($task['parsed_name']); ?>')" class="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-blue-100">Update Status</button>
                    <?php else: ?>
                    <div class="text-green-600 flex items-center gap-1 font-medium">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                        Completed
                    </div>
                    <?php endif; ?>
                </div>
            </div>
            <?php if ($task['user_remarks']): ?>
            <div class="mt-4 p-3 bg-slate-50 rounded-lg text-sm text-slate-600 italic">
                <strong>Latest Remark:</strong> <?php echo htmlspecialchars($task['user_remarks']); ?>
            </div>
            <?php endif; ?>
        </div>
        <?php endforeach; ?>
        
        <?php if (empty($myTasks)): ?>
        <div class="bg-white rounded-2xl border border-dotted border-slate-300 p-12 text-center text-slate-500">
            No tasks assigned to you yet.
        </div>
        <?php endif; ?>
    </div>
</div>

<!-- Update Status Modal -->
<div id="updateModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] hidden flex items-center justify-center p-4">
    <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
        <h3 class="text-xl font-bold mb-4">Update Task: <span id="updateTitle" class="text-blue-600"></span></h3>
        <form id="updateForm">
            <input type="hidden" id="updateId" name="assignment_id">
            
            <div class="mb-4">
                <label class="block text-sm font-medium mb-1">Status</label>
                <select name="status" class="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="WORK_IN_PROGRESS">Work In Progress</option>
                    <option value="COMPLETED">Completed</option>
                </select>
            </div>

            <div class="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label class="block text-sm font-medium mb-1">Actual Qty</label>
                    <input type="number" step="0.01" name="updated_quantity" class="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500">
                </div>
                <div>
                    <label class="block text-sm font-medium mb-1">Actual Rate</label>
                    <input type="number" step="0.01" name="updated_rate" class="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500">
                </div>
            </div>

            <div class="mb-6">
                <label class="block text-sm font-medium mb-1">Remarks</label>
                <textarea name="user_remarks" rows="2" class="w-full px-4 py-2 rounded-lg border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Source details, transport info..."></textarea>
            </div>

            <button type="submit" class="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg">Submit Update</button>
            <button type="button" onclick="closeUpdateModal()" class="w-full mt-2 text-slate-500 text-sm py-2">Cancel</button>
        </form>
    </div>
</div>

<script>
function openUpdateModal(id, title) {
    document.getElementById('updateId').value = id;
    document.getElementById('updateTitle').innerText = title;
    document.getElementById('updateModal').classList.remove('hidden');
}

function closeUpdateModal() {
    document.getElementById('updateModal').classList.add('hidden');
}

document.getElementById('updateForm').onsubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const response = await fetch('api/update_task.php', {
        method: 'POST',
        body: formData
    });
    const result = await response.json();
    if (result.success) {
        location.reload();
    } else {
        alert(result.error);
    }
}
</script>

<?php include 'templates/footer.php'; ?>
