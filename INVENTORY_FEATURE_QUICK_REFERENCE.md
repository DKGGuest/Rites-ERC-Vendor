# 🚀 Inventory View/Edit/Delete - Quick Reference

## 📍 Location
**Vendor Dashboard → Inventory Entry Tab → "Inventory - List of Entries" Section**

---

## 🎯 Quick Actions

### View Any Entry
```javascript
// Click the "👁️ View" button in any row
// Opens ViewInventoryEntryModal
```

### Edit FRESH_PO Entry
```javascript
// 1. Click "👁️ View" button
// 2. Click "Modify" button (only visible for FRESH_PO)
// Currently shows placeholder alert
```

### Delete FRESH_PO Entry
```javascript
// 1. Click "👁️ View" button
// 2. Click "Delete" button (only visible for FRESH_PO)
// 3. Confirm in DeleteConfirmationModal
```

---

## 🔧 API Endpoints

### Get Entry by ID
```
GET /api/vendor/inventory/entries/detail/{id}
```

### Update Entry
```
PUT /api/vendor/inventory/entries/{id}
```
**Restriction:** Only FRESH_PO entries

### Delete Entry
```
DELETE /api/vendor/inventory/entries/{id}
```
**Restriction:** Only FRESH_PO entries

---

## 📦 Components

### ViewInventoryEntryModal
**Path:** `src/components/ViewInventoryEntryModal.js`  
**Props:**
- `isOpen` - Boolean
- `onClose` - Function
- `entryId` - Number
- `onEdit` - Function
- `onDelete` - Function
- `onRefresh` - Function

**Usage:**
```jsx
<ViewInventoryEntryModal
  isOpen={isViewInventoryModalOpen}
  onClose={handleCloseViewInventoryModal}
  entryId={selectedInventoryEntry?.id}
  onEdit={handleEditInventoryEntry}
  onDelete={handleDeleteInventoryEntry}
  onRefresh={() => console.log('Refresh')}
/>
```

---

### DeleteConfirmationModal
**Path:** `src/components/DeleteConfirmationModal.js`  
**Props:**
- `isOpen` - Boolean
- `onClose` - Function
- `onConfirm` - Function
- `entry` - Object
- `isDeleting` - Boolean

**Usage:**
```jsx
<DeleteConfirmationModal
  isOpen={isDeleteConfirmModalOpen}
  onClose={handleCloseDeleteConfirmModal}
  onConfirm={handleConfirmDelete}
  entry={selectedInventoryEntry}
  isDeleting={isDeletingEntry}
/>
```

---

## 🎨 Status Colors

| Status | Color | Badge |
|--------|-------|-------|
| FRESH_PO | Green | 🟢 |
| UNDER_INSPECTION | Blue | 🔵 |
| ACCEPTED | Green | ✅ |
| REJECTED | Red | ❌ |
| EXHAUSTED | Gray | ⚫ |

---

## 🔐 Permissions

| Action | FRESH_PO | Other Statuses |
|--------|----------|----------------|
| View | ✅ | ✅ |
| Edit | ✅ | ❌ |
| Delete | ✅ | ❌ |

---

## 🐛 Common Issues

### Issue: View button not appearing
**Solution:** Check that `inventoryColumns` includes the Actions column

### Issue: Edit/Delete buttons visible for non-FRESH_PO
**Solution:** Check `entry.status === 'FRESH_PO'` condition in ViewInventoryEntryModal

### Issue: Delete fails with 400 error
**Solution:** Backend only allows deletion of FRESH_PO entries

### Issue: Modal doesn't close
**Solution:** Check that `onClose` handler is properly connected

---

## 📝 Code Snippets

### Add View Button to Table
```jsx
{
  key: 'actions',
  label: 'Actions',
  render: (value, row) => (
    <button
      className="btn btn-sm btn-primary"
      onClick={(e) => {
        e.stopPropagation();
        handleViewInventoryEntry(row);
      }}
    >
      👁️ View
    </button>
  )
}
```

### Handler Functions
```javascript
const handleViewInventoryEntry = (entry) => {
  setSelectedInventoryEntry(entry);
  setIsViewInventoryModalOpen(true);
};

const handleDeleteInventoryEntry = (entry) => {
  setIsViewInventoryModalOpen(false);
  setSelectedInventoryEntry(entry);
  setIsDeleteConfirmModalOpen(true);
};

const handleConfirmDelete = async () => {
  setIsDeletingEntry(true);
  try {
    const response = await inventoryService.deleteInventoryEntry(
      selectedInventoryEntry.id
    );
    if (response.success) {
      setInventoryEntries(prev => 
        prev.filter(e => e.id !== selectedInventoryEntry.id)
      );
      setIsDeleteConfirmModalOpen(false);
      alert('✅ Entry deleted successfully!');
    }
  } catch (error) {
    alert('❌ Failed to delete entry');
  } finally {
    setIsDeletingEntry(false);
  }
};
```

---

## 🧪 Testing Checklist

- [ ] View button appears for all entries
- [ ] View modal displays all fields correctly
- [ ] Edit/Delete buttons only show for FRESH_PO
- [ ] Delete confirmation works
- [ ] Successful deletion removes entry from table
- [ ] Error handling works (network errors, backend errors)
- [ ] Loading states display correctly
- [ ] Modals close properly
- [ ] No console errors

---

## 📚 Related Documentation

- **Feature Guide:** `INVENTORY_VIEW_EDIT_DELETE_FEATURE.md`
- **Testing Guide:** `TESTING_INVENTORY_VIEW_EDIT_DELETE.md`
- **API Documentation:** Backend Swagger UI at `http://localhost:8080/swagger-ui.html`

---

**Last Updated:** 2026-01-09  
**Version:** 1.0.0

